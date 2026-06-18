<?php

namespace App\Services\Recruitment;

use App\Models\Brief;
use App\Models\Candidat;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

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
     * All scored dimensions are deterministic — no AI cost.
     */
    private const DETERMINISTIC_DIMENSIONS = ['experience', 'education', 'location'];

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
     * @param  Collection<int, Candidat>  $candidates
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

        $results = [];

        foreach ($candidates as $i => $candidate) {
            $key = $candidate->linkedin_url ?? $i;
            $dims = $this->computeDeterministicDimensions($brief, $candidate);

            $breakdown = [];
            foreach ($dims as $dimension => $raw) {
                $weight = $weights[$dimension] ?? 0;
                $breakdown[$dimension] = (float) $raw * ($weight / $total);
            }

            $finalScore = round(array_sum($breakdown), 2);
            $aiAnalysis = $this->generateAnalysis($brief, $candidate);

            logger()->info('[Scorer] 🏆 Final score for candidate', [
                'linkedin_url' => $key,
                'full_name' => $candidate->full_name,
                'score' => $finalScore,
                'breakdown' => $breakdown,
            ]);
            $results[$key] = [
                'score' => $finalScore,
                'breakdown' => $breakdown,
                'ai_analysis' => $aiAnalysis,
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
        if (is_null($brief->min_experience_years) || is_null($candidate->experience_years)) {
            return 0.0;
        }

        // When brief requires 0 years, any candidate qualifies
        if ($brief->min_experience_years == 0) {
            return 100.0;
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
            return 0.0;
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
            return 0.0;
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

    /**
     * Public entry point so the controller can trigger analysis on demand
     * for candidates that were imported without one.
     */
    public function generateAnalysisPublic(Brief $brief, Candidat $candidate): ?string
    {
        return $this->generateAnalysis($brief, $candidate);
    }

    /**
     * Generate a complete bilingual recruiter synthesis for a single candidate
     * using their full raw LinkedIn data and all brief fields.
     *
     * Returns a JSON-encoded string with "fr" and "en" keys, or null on failure.
     */
    private function generateAnalysis(Brief $brief, Candidat $candidate): ?string
    {
        $rawData = $candidate->raw_data;
        if (empty($rawData)) {
            return null;
        }

        // Extract only the fields relevant to a recruiter synthesis — drop photos, URLs, pagination, etc.
        $profile = [
            'firstName' => $rawData['firstName'] ?? null,
            'lastName' => $rawData['lastName'] ?? null,
            'headline' => $rawData['headline'] ?? null,
            'location' => $rawData['location']['linkedinText'] ?? null,
            'about' => $rawData['about'] ?? null,
            'openToWork' => $rawData['openToWork'] ?? false,
            'experience' => collect($rawData['experience'] ?? [])->map(fn ($e) => [
                'position' => $e['position'] ?? $e['title'] ?? null,
                'companyName' => $e['companyName'] ?? null,
                'employmentType' => $e['employmentType'] ?? null,
                'location' => $e['location'] ?? null,
                'startDate' => $e['startDate']['text'] ?? null,
                'endDate' => $e['endDate']['text'] ?? null,
                'duration' => $e['duration'] ?? null,
                'description' => mb_substr($e['description'] ?? '', 0, 400),
            ])->values()->all(),
            'education' => collect($rawData['education'] ?? [])->map(fn ($e) => [
                'schoolName' => $e['schoolName'] ?? null,
                'degree' => $e['degree'] ?? null,
                'fieldOfStudy' => $e['fieldOfStudy'] ?? null,
                'period' => $e['period'] ?? null,
                'description' => mb_substr($e['description'] ?? '', 0, 200),
            ])->values()->all(),
            'skills' => collect($rawData['skills'] ?? [])->pluck('name')->filter()->values()->all(),
            'languages' => collect($rawData['languages'] ?? [])->map(fn ($l) => $l['name'] ?? $l)->filter()->values()->all(),
            'certifications' => collect($rawData['certifications'] ?? [])->map(fn ($c) => $c['name'] ?? null)->filter()->values()->all(),
        ];

        $briefContext = array_filter([
            'title' => $brief->title,
            'sector' => $brief->sector,
            'contract_type' => $brief->contract_type?->value ?? $brief->contract_type,
            'location' => $brief->location,
            'salary_range' => $brief->salary_range,
            'seniority_level' => $brief->seniority_level,
            'min_experience_years' => $brief->min_experience_years,
            'education_level' => $brief->education_level,
            'languages' => $brief->languages,
            'mission_description' => $brief->mission_description,
            'required_skills' => $brief->required_skills,
            'soft_skills' => $brief->soft_skills,
            'target_companies' => $brief->target_companies,
        ]);

        $profileJson = json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $briefJson = json_encode($briefContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $prompt = <<<PROMPT
You are an expert recruitment analyst. Your role is to produce a complete, structured candidate synthesis that gives a recruiter everything they need to make an informed decision — without reading the raw profile themselves.

## Job Brief
{$briefJson}

## Candidate LinkedIn Profile
{$profileJson}

## Your Task
Write a thorough recruiter synthesis in BOTH French and English based strictly on the data above.
Be specific: reference actual job titles, companies, durations, skills, and degrees from the profile.
Do NOT invent information. If something is absent from the profile, say so explicitly.

Return ONLY valid JSON — no markdown fences, no text outside the JSON.

Required output shape:
{
  "fr": {
    "accroche": "1 phrase percutante résumant qui est ce candidat et sa pertinence pour ce poste spécifique",
    "parcours": "Résumé du parcours professionnel : postes occupés, entreprises, durées, progression de carrière",
    "competences_cles": "Compétences techniques et comportementales visibles dans le profil, comparées aux exigences du brief",
    "formation": "Diplômes, formations et certifications pertinents pour le poste",
    "points_forts": ["point fort 1", "point fort 2", "point fort 3"],
    "points_attention": ["point de vigilance 1", "point de vigilance 2"],
    "verdict": "Recommandation finale : ce candidat mérite-t-il un entretien ? Justification concrète basée sur l'adéquation au brief."
  },
  "en": {
    "accroche": "1 punchy sentence summarising who this candidate is and their fit for this specific role",
    "parcours": "Summary of professional path: positions held, companies, durations, career progression",
    "competences_cles": "Hard and soft skills visible in the profile, mapped against brief requirements",
    "formation": "Degrees, training and certifications relevant to the role",
    "points_forts": ["strength 1", "strength 2", "strength 3"],
    "points_attention": ["concern 1", "concern 2"],
    "verdict": "Final recommendation: does this candidate deserve an interview? Concrete justification based on brief fit."
  }
}
PROMPT;

        $key = config('services.openrouter.key');
        $models = config('services.openrouter.analysis_models', ['google/gemini-2.0-flash-exp:free']);

        logger()->info('[Scorer/AI] 🚀 Generating candidate synthesis', [
            'candidate' => $candidate->full_name,
            'brief_id' => $brief->id,
        ]);

        foreach ($models as $model) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer '.$key,
                    'HTTP-Referer' => config('app.url', 'http://localhost'),
                    'X-Title' => 'TalentAI',
                ])->timeout(30)->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'max_tokens' => 1200,
                ]);

                if (! $response->successful()) {
                    logger()->warning('[Scorer/AI] Model failed, trying next', [
                        'model' => $model,
                        'status' => $response->status(),
                    ]);

                    continue;
                }

                $text = $response->json('choices.0.message.content', '');
                $text = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', trim($text));

                json_decode($text, true, 512, JSON_THROW_ON_ERROR);

                logger()->info('[Scorer/AI] ✅ Synthesis generated', [
                    'candidate' => $candidate->full_name,
                    'model' => $model,
                ]);

                return $text;

            } catch (\Throwable $e) {
                logger()->warning('[Scorer/AI] Model exception, trying next', [
                    'model' => $model,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        logger()->warning('[Scorer/AI] ⚠ All models failed, synthesis skipped.', [
            'candidate' => $candidate->full_name,
        ]);

        return null;
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
            'experience' => 50,
            'education' => 25,
            'location' => 25,
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
