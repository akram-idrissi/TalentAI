<?php

namespace App\Services\Recruitment;

use App\Models\Brief;
use App\Models\Candidat;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Scores candidates against a job brief across six weighted dimensions.
 *
 * Architecture: deterministic dimensions (experience, education, location) are
 * computed in PHP. Semantic dimensions (required_skills, soft_skills, sector)
 * are scored by Claude Haiku in a SINGLE batched API call covering ALL candidates
 * at once — keeping cost to ~$0.02 per sourcing run regardless of candidate count.
 *
 * Usage (single candidate):
 *   $result = $service->score($brief, $candidate);
 *   // ['score' => 74.5, 'breakdown' => [...]]
 *
 * Usage (bulk — preferred, triggers one AI call for the whole batch):
 *   $results = $service->scoreBatch($brief, $candidates);
 *   // ['linkedin_url' => ['score' => ..., 'breakdown' => ...], ...]
 */
class CandidateScoringService
{
    /**
     * Dimensions scored deterministically in PHP (no AI cost).
     */
    private const DETERMINISTIC_DIMENSIONS = ['experience', 'education', 'location'];

    /**
     * Dimensions scored semantically via a single batched Claude call.
     */
    private const AI_DIMENSIONS = ['required_skills', 'soft_skills', 'sector'];

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Score a single candidate. Triggers one AI call for the three semantic
     * dimensions. If you have multiple candidates, use scoreBatch() instead
     * to share that cost across the whole set.
     *
     * @return array{score: float, breakdown: array<string, float>}
     */
    public function score(Brief $brief, Candidat $candidate): array
    {
        $results = $this->scoreBatch($brief, collect([$candidate]));
        $key = $candidate->linkedin_url ?? 0;

        return $results[$key] ?? $this->fallbackScore($brief);
    }

    /**
     * Score a collection of candidates against a brief in one AI call.
     * This is the preferred entry point from ApifyCandidateImporter.
     *
     * @param  Collection<int, Candidate>  $candidates
     * @return array<string, array{score: float, breakdown: array<string, float>}>
     *                                                                             Keyed by linkedin_url (falls back to collection index).
     */
    public function scoreBatch(Brief $brief, Collection $candidates): array
    {
        logger()->info('[Scorer] ▶ scoreBatch called', [
            'brief_id' => $brief->id,
            'candidate_count' => $candidates->count(),
        ]);
        if ($candidates->isEmpty()) {
            logger()->warning('[Scorer] ⚠ No candidates provided, returning empty.');

            return [];
        }

        $weights = $this->resolveWeights($brief);
        $total = array_sum($weights) ?: 100;
        logger()->debug('[Scorer] ⚖ Resolved weights', [
            'weights' => $weights,
            'total' => $total,
        ]);
        logger()->info('[Scorer] 🔢 Computing deterministic scores for all candidates');
        // 1. Compute deterministic scores for every candidate (pure PHP, free).
        $deterministicScores = $candidates->mapWithKeys(
            fn (Candidat $c, int $i) => [
                ($c->linkedin_url ?? $i) => $this->computeDeterministicDimensions($brief, $c),
            ]
        )->all();

        // 2. Get AI scores for all candidates in one call.
        logger()->info('[Scorer] 🤖 Fetching AI scores batch', [
            'brief_id' => $brief->id,
            'candidate_count' => $candidates->count(),
        ]);
        $aiScores = $this->fetchAiScoresBatch($brief, $candidates);

        logger()->info('[Scorer] ✅ AI scores received', [
            'scored_keys' => array_keys($aiScores),
        ]);
        // 3. Merge and apply weights.
        $results = [];

        foreach ($candidates as $i => $candidate) {
            $key = $candidate->linkedin_url ?? $i;
            $dims = array_merge(
                $deterministicScores[$key] ?? [],
                $aiScores[$key] ?? $this->neutralAiDimensions(),
            );

            $breakdown = [];
            foreach ($dims as $dimension => $raw) {
                $weight = $weights[$dimension] ?? 0;
                $breakdown[$dimension] = $raw * ($weight / $total);
            }

            $finalScore = round(array_sum($breakdown), 2);

            logger()->info('[Scorer] 🏆 Final score for candidate', [
                'linkedin_url' => $key,
                'full_name' => $candidate->full_name,
                'score' => $finalScore,
                'breakdown' => $breakdown,
            ]);
            $results[$key] = [
                'score' => round(array_sum($breakdown), 2),
                'breakdown' => $breakdown,
            ];
        }
        logger()->info('[Scorer] 🏁 scoreBatch complete', [
            'brief_id' => $brief->id,
            'total_scored' => count($results),
        ]);

        return $results;
    }

    /**
     * @return array<string, float> Raw 0–100 scores for deterministic dimensions.
     */
    private function computeDeterministicDimensions(Brief $brief, Candidat $candidate): array
    {
        return [
            'experience' => $this->scoreExperience($brief, $candidate),
            'education' => $this->scoreEducation($brief, $candidate),
            'location' => $this->scoreLocation($brief, $candidate),
        ];
    }

    /**
     * Ratio-based experience score.
     *
     * Tiers (candidate_years / required_years):
     *   >= 1.00 → 100   meets or exceeds
     *   >= 0.75 →  75   close
     *   >= 0.50 →  50   halfway
     *   <  0.50 →  20   significantly under
     *   missing →  50   neutral (no data = no penalty)
     */
    private function scoreExperience(Brief $brief, Candidat $candidate): float
    {
        if (! $brief->min_experience_years || ! $candidate->experience_years) {
            return 50.0;
        }

        $ratio = $candidate->experience_years / $brief->min_experience_years;

        return match (true) {
            $ratio >= 1.0 => 100.0,
            $ratio >= 0.75 => 75.0,
            $ratio >= 0.5 => 50.0,
            default => 20.0,
        };
    }

    /**
     * Rank-based education score.
     *
     * Normalized level map (matches extractHighestDegree output from importer):
     *   bac=1, bac+2=2, bac+3/licence=3, bac+4=4, bac+5/master/mba=5, phd/doctorat=6
     *
     * Scoring:
     *   candidate >= required     → 100
     *   candidate == required - 1 →  65   one level below
     *   candidate <  required - 1 →  20
     *   unrecognized or missing   →  50   neutral
     */
    private function scoreEducation(Brief $brief, Candidat $candidate): float
    {
        if (! $brief->education_level || ! $candidate->education_level) {
            return 50.0;
        }

        $levels = [
            'bac' => 1, 'bac+2' => 2, 'bac+3' => 3,
            'bac+4' => 4, 'bac+5' => 5, 'licence' => 3,
            'master' => 5, 'mba' => 5, 'phd' => 6,
            'doctorat' => 6, 'bachelor' => 3, 'bsc' => 3,
            'msc' => 5, 'doctor' => 6,
        ];

        $required = $levels[strtolower($brief->education_level)] ?? null;
        $actual = $levels[strtolower($candidate->education_level)] ?? null;

        if (! $required || ! $actual) {
            return 50.0;
        }

        return match (true) {
            $actual >= $required => 100.0,
            $actual === $required - 1 => 65.0,
            default => 20.0,
        };
    }

    /**
     * Location match by part-count.
     *
     * Scoring:
     *   2+ parts match → 100   exact city + country
     *   1 part matches →  60   same country, different city
     *   0 parts match  →  20
     *   missing        →  50   neutral
     */
    private function scoreLocation(Brief $brief, Candidat $candidate): float
    {
        if (! $brief->location || ! $candidate->location) {
            return 50.0;
        }

        $briefParts = collect(explode(',', $brief->location))
            ->map(fn ($p) => strtolower(trim($p)))
            ->filter();

        $candidateLoc = strtolower($candidate->location);
        $hits = $briefParts->filter(fn ($p) => str_contains($candidateLoc, $p))->count();

        return match (true) {
            $hits >= 2 => 100.0,
            $hits === 1 => 60.0,
            default => 20.0,
        };
    }

    // -------------------------------------------------------------------------
    // Batched AI scoring
    // -------------------------------------------------------------------------

    /**
     * Send all candidates to Claude Haiku in one request and parse back
     * per-candidate scores for required_skills, soft_skills, and sector.
     *
     * Prompt design priorities:
     *   - One JSON object with all candidates keyed by index avoids repeated context.
     *   - Haiku (not Sonnet) keeps cost at ~$0.01–0.02 per 50-candidate run.
     *   - max_tokens is capped at 600: 50 candidates × ~10 tokens each + overhead.
     *   - On any parse failure, neutral 50.0 scores are used (no exception thrown).
     *
     * @param  Collection<int, Candidate>  $candidates
     * @return array<string, array{required_skills: float, soft_skills: float, sector: float}>
     *                                                                                         Keyed by linkedin_url (falls back to collection index).
     */
    private function fetchAiScoresBatch(Brief $brief, Collection $candidates): array
    {
        logger()->info('[Scorer/AI] ▶ Building prompt for AI batch scoring', [
            'brief_id' => $brief->id,
            'candidate_count' => $candidates->count(),
        ]);
        $briefContext = $this->buildBriefContext($brief);
        $candidateList = $this->buildCandidateList($candidates);
        logger()->debug('[Scorer/AI] 📝 Prompt context built', [
            'brief_context' => $briefContext,
            'candidate_list_preview' => mb_substr($candidateList, 0, 500),
        ]);
        $prompt = <<<PROMPT
            You are a recruitment scoring engine. Score each candidate 0–100 on three dimensions.

            ## Job brief
            {$briefContext}

            ## Candidates
            {$candidateList}

            ## Instructions
            Return ONLY a valid JSON object — no prose, no markdown fences.
            Each key is the candidate index (integer). Each value has three integer fields.

            Scoring guidance:
            - required_skills: how many required skills does the candidate demonstrably have? 100 = all, 0 = none.
            - soft_skills: how well does headline + summary reflect the required soft skills? Consider synonyms and implied traits.
            - sector: how relevant is the candidate's background to the job sector? Resolve abbreviations (IT = Information Technology).
            Return ONLY valid JSON.
            Do not include explanations.
            Do not include markdown.
            If unsure, return 0.
            All values must be integers between 0 and 100.
            Example output shape (indices are illustrative):
            {"0":{"required_skills":85,"soft_skills":70,"sector":90},"1":{"required_skills":40,"soft_skills":60,"sector":75}}
            
            PROMPT;

        try {

            // $text = $response->json('content.0.text', '{}');
            logger()->info('[Scorer/AI] 🚀 Sending request to OpenRouter', [
                'model' => 'meta-llama/llama-3.1-8b-instruct',
                'candidate_count' => $candidates->count(),
            ]);
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.config('services.openrouter.key'),
                'HTTP-Referer' => 'http://localhost',
                'X-Title' => 'TalentAI',
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'meta-llama/llama-3.1-8b-instruct',
                'messages' => [
                    ['role' => 'user', 'content' => trim($prompt)],
                ],
                'max_tokens' => 600,
            ]);
            $text = $response->json('choices.0.message.content', '{}');
            logger()->info('[Scorer/AI] ✅ Response received from OpenRouter', [
                'http_status' => $response->status(),
                'ok' => $response->ok(),
            ]);
            $text = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($text));
            logger()->debug('[Scorer/AI] 🧹 Cleaned AI response text', [
                'cleaned' => $text,
            ]);
            $parsed = json_decode($text, true, 512, JSON_THROW_ON_ERROR);
            logger()->info('[Scorer/AI] ✅ JSON parsed successfully', [
                'keys_returned' => array_keys($parsed),
            ]);

            return $this->mapAiResponseToKeys($candidates, $parsed);

        } catch (\Throwable $e) {
            Log::warning('AI batch scoring failed, using neutral fallbacks.', [
                'brief_id' => $brief->id,
                'error' => $e->getMessage(),
            ]);

            // Graceful degradation: every candidate gets neutral AI scores.
            return $candidates->mapWithKeys(
                fn (Candidat $c, int $i) => [
                    ($c->linkedin_url ?? $i) => $this->neutralAiDimensions(),
                ]
            )->all();
        }
    }

    /**
     * Build a compact brief summary for the AI prompt.
     * Only fields relevant to AI dimensions are included to save tokens.
     */
    private function buildBriefContext(Brief $brief): string
    {
        $parts = ["Title: {$brief->title}"];

        if ($brief->sector) {
            $parts[] = "Sector: {$brief->sector}";
        }
        if ($brief->required_skills) {
            $parts[] = "Required skills: {$brief->required_skills}";
        }
        if ($brief->soft_skills) {
            $parts[] = "Soft skills: {$brief->soft_skills}";
        }

        return implode("\n", $parts);
    }

    /**
     * Build a compact numbered candidate list for the AI prompt.
     * Only fields relevant to AI dimensions are included (skills, headline, summary).
     * Summaries are capped at 300 chars to control token count.
     */
    private function buildCandidateList(Collection $candidates): string
    {
        return $candidates->values()->map(function (Candidat $c, int $i) {
            $skills = is_array($c->skills) ? implode(', ', $c->skills) : ($c->skills ?? '');
            $summary = mb_substr($c->summary ?? '', 0, 300);
            $parts = ["[{$i}] {$c->full_name}"];

            if ($c->headline) {
                $parts[] = "  Headline: {$c->headline}";
            }
            if ($skills) {
                $parts[] = "  Skills: {$skills}";
            }
            if ($summary) {
                $parts[] = "  Summary: {$summary}";
            }

            return implode("\n", $parts);
        })->implode("\n\n");
    }

    /**
     * Map the AI response (keyed by sequential index) back to linkedin_url keys
     * so the result aligns with the deterministic scores map.
     *
     * @param  array<int, array{required_skills: int, soft_skills: int, sector: int}>  $parsed
     * @return array<string, array{required_skills: float, soft_skills: float, sector: float}>
     */
    private function mapAiResponseToKeys(Collection $candidates, array $parsed): array
    {
        $result = [];

        foreach ($candidates->values() as $i => $candidate) {
            $key = $candidate->linkedin_url ?? $i;
            $raw = $parsed[(string) $i] ?? $parsed[$i] ?? null;

            $result[$key] = $raw ? [
                'required_skills' => (float) min(100, max(0, $raw['required_skills'] ?? 50)),
                'soft_skills' => (float) min(100, max(0, $raw['soft_skills'] ?? 50)),
                'sector' => (float) min(100, max(0, $raw['sector'] ?? 50)),
            ] : $this->neutralAiDimensions();
        }

        return $result;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Neutral AI dimension scores used when the brief lacks context
     * or when the AI call fails. 50.0 = no signal, no penalty.
     *
     * @return array{required_skills: float, soft_skills: float, sector: float}
     */
    private function neutralAiDimensions(): array
    {
        return ['required_skills' => 50.0, 'soft_skills' => 50.0, 'sector' => 50.0];
    }

    /**
     * Resolve scoring weights from the brief or fall back to defaults.
     * Ensures all six dimensions are always present.
     *
     * @return array<string, int>
     */
    private function resolveWeights(Brief $brief): array
    {
        return array_merge($this->defaultWeights(), $brief->scoring_weights ?? []);
    }

    /**
     * Default weights. Required skills and experience carry the most signal.
     * Location is weighted low to avoid penalizing remote-friendly candidates.
     *
     * Total = 100.
     *
     * @return array<string, int>
     */
    private function defaultWeights(): array
    {
        return [
            'experience' => 25,
            'required_skills' => 25,
            'education' => 15,
            'soft_skills' => 20,
            'sector' => 10,
            'location' => 5,
        ];
    }

    /**
     * Fallback full score result used when a single-candidate lookup fails.
     *
     * @return array{score: float, breakdown: array<string, float>}
     */
    private function fallbackScore(Brief $brief): array
    {
        $weights = $this->resolveWeights($brief);
        $total = array_sum($weights) ?: 100;

        $breakdown = array_map(
            fn (int $w) => 50.0 * ($w / $total),
            $weights
        );

        return ['score' => round(array_sum($breakdown), 2), 'breakdown' => $breakdown];
    }
}
