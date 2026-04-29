<?php

namespace App\Services\Recruitment;

use App\Models\Brief;
use App\Models\Candidate;

class CandidateScoringService
{
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

        ];

        return [
            'score' => round(array_sum($breakdown), 2),
            'breakdown' => $breakdown,
        ];
    }

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

    private function scoreSector(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->sector || ! $candidate->sector) {
            return 50.0;
        }
        similar_text(strtolower($brief->sector), strtolower($candidate->sector), $pct);

        return $pct;
    }

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

    private function scoreEducation(Brief $brief, Candidate $candidate): float
    {
        if (! $brief->education_level || ! $candidate->education_level) {
            return 50.0;
        }

        $levels = ['Bac' => 1, 'Bac+2' => 2, 'Bac+3' => 3, 'Bac+4' => 4, 'Bac+5' => 5,
            'licence' => 3, 'master' => 5, 'mba' => 5, 'phd' => 6, 'doctorat' => 6];

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

    private function defaultWeights(): array
    {
        return ['experience' => 20, 'education' => 20, 'sector' => 20, 'soft_skills' => 20, 'location' => 20];
    }
}
