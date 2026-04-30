<?php

namespace App\Services\Recruitment;

use App\Models\Brief;
use App\Models\Candidate;

/**
 * Scores a candidate against a job brief across five weighted dimensions.
 * Each dimension returns a raw 0–100 float, which is then multiplied by
 * its weight fraction before being summed into the final score.
 */
class CandidateScoringService
{
    /**
     * Score a candidate against a brief.
     * Uses brief's scoring_weights if set, otherwise falls back to equal 20/20 weights.
     *
     * @param  Brief  $brief  The job brief defining requirements and weights.
     * @param  Candidate  $candidate  The candidate to evaluate.
     * @return array{score: float, breakdown: array<string, float>}
     *                                                              e.g. ['score' => 74.5, 'breakdown' => ['experience' => 20.0, 'education' => 18.0, ...]]
     */
    public function score(Brief $brief, Candidate $candidate): array
    {
        $weights = $brief->scoring_weights ?? $this->defaultWeights();
        $total = array_sum($weights) ?: 100;

        $breakdown = [
            'experience' => $this->scoreExperience($brief, $candidate) * ($weights['experience'] / $total),
            'education' => $this->scoreEducation($brief, $candidate) * ($weights['education'] / $total),
            'sector' => $this->scoreSector($brief, $candidate) * ($weights['sector'] / $total),
            'soft_skills' => $this->scoreSoftSkills($brief, $candidate) * ($weights['soft_skills'] / $total),
            'location' => $this->scoreLocation($brief, $candidate) * ($weights['location'] / $total),
            // 'required_skills' => $this->scoreSkills($brief, $candidate) * ($weights['required_skills'] / $total),
        ];

        return [
            'score' => round(array_sum($breakdown), 2),
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Score how well the candidate's experience meets the minimum requirement.
     * Returns 50.0 if either value is missing (neutral / no penalty).
     *
     * Scoring tiers (ratio = candidate_years / required_years):
     *   >= 1.00 → 100  (meets or exceeds)
     *   >= 0.75 → 75   (close)
     *   >= 0.50 → 50   (halfway)
     *   <  0.50 → 20   (significantly under)
     *
     * @return float 0–100
     */
    private function scoreExperience(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->min_experience_years || ! $candidate->experience_years) {
            return 50.0;
        }

        $ratio = $candidate->experience_years / $brief->min_experience_years;

        if ($ratio >= 1.0) {
            return 100.0;
        }
        if ($ratio >= 0.75) {
            return 75.0;
        }
        if ($ratio >= 0.5) {
            return 50.0;
        }

        return 20.0;
    }

    /**
     * Score sector relevance using PHP's similar_text() percentage.
     * Returns 50.0 if either sector is missing.
     * Note: similar_text can return low scores for abbreviations vs full names (e.g. "IT" vs "Information Technology").
     *
     * @return float 0–100
     */
    private function scoreSector(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->sector || ! $candidate->sector) {
            return 50.0;
        }

        $briefWords = collect(explode(' ', strtolower($brief->sector)))->filter();
        $candidateText = strtolower($candidate->sector.' '.($candidate->headline ?? ''));
        $hits = $briefWords->filter(fn ($w) => str_contains($candidateText, $w))->count();

        return $briefWords->count() > 0
            ? min(100, ($hits / $briefWords->count()) * 130) // boost partial matches
            : 50.0;
    }

    /**
     * Score location match by checking how many comma-separated parts of the brief's
     * location appear in the candidate's location string.
     * Returns 50.0 if either location is missing.
     *
     * Scoring:
     *   2+ parts match → 100  (e.g. "Rabat" and "Morocco" both found)
     *   1 part matches → 60   (e.g. same country but different city)
     *   0 parts match  → 20
     *
     * @return float 0–100
     */
    private function scoreLocation(Brief $brief, Candidate $candidate): float
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

    /**
     * Score education level by mapping both brief and candidate values to a numeric rank,
     * then comparing them. Returns 50.0 if either value is missing or unrecognized.
     *
     * Rank map: Bac=1, Bac+2=2, Bac+3/licence=3, Bac+4=4, Bac+5/master/mba=5, phd/doctorat=6
     *
     * Scoring:
     *   candidate >= required     → 100
     *   candidate == required - 1 → 65  (one level below)
     *   candidate <  required - 1 → 20
     *
     * @return float 0–100
     */
    private function scoreEducation(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->education_level || ! $candidate->education_level) {
            return 50.0;
        }

        $levels = [
            'bac' => 1, 'bac+2' => 2, 'bac+3' => 3, 'bac+4' => 4, 'bac+5' => 5,
            'licence' => 3, 'master' => 5, 'mba' => 5, 'phd' => 6, 'doctorat' => 6,
        ];

        $required = $levels[strtolower($brief->education_level)] ?? null;
        $actual = $levels[strtolower($candidate->education_level)] ?? null;

        if (! $required || ! $actual) {
            return 50.0;
        }
        if ($actual >= $required) {
            return 100.0;
        }
        if ($actual === $required - 1) {
            return 65.0;
        }

        return 20.0;
    }

    /**
     * Score soft skills by checking how many of the brief's required soft skills
     * appear as substrings in the candidate's summary text.
     * Returns 50.0 if no soft skills are required.
     *
     * Note: relies on substring matching — "problem solving" won't match "problem-solver".
     *
     * @return float 0–100
     */
    private function scoreSoftSkills(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->soft_skills) {
            return 50.0;
        }

        $required = collect(explode(',', $brief->soft_skills))->map(fn ($s) => strtolower(trim($s)));
        $candidateText = strtolower($candidate->summary ?? '');
        $hits = $required->filter(fn ($s) => str_contains($candidateText, $s))->count();

        return $required->count() > 0 ? ($hits / $required->count()) * 100 : 50.0;
    }

    private function scoreSkills(Brief $brief, Candidate $candidate): float
    {
        $required = $this->parseMultiValue($brief->required_skills);
        if ($required->isEmpty()) {
            return 50.0;
        }

        $candidateSkills = collect($candidate->skills)
            ->map(fn ($s) => strtolower(trim($s)));

        $hits = $required->filter(fn ($req) => $candidateSkills->contains(fn ($s) => str_contains($s, strtolower($req)))
        )->count();

        return ($hits / $required->count()) * 100;
    }

    /**
     * Default scoring weights when the brief doesn't define its own.
     * All five dimensions are weighted equally at 20 points each (total = 100).
     *
     * @return array<string, int>
     */
    private function defaultWeights(): array
    {
        return ['experience' => 20, 'education' => 20, 'sector' => 20, 'soft_skills' => 20, 'location' => 20];
    }
}
