<?php

namespace App\Services\Recruitment;

use App\Models\ApifyRun;
use App\Models\Candidate;
use Illuminate\Support\Facades\Http;

/**
 * Fetches scraped LinkedIn profiles from a completed Apify run,
 * upserts them as Candidate records, scores each one against the brief,
 * and attaches them to the brief via the pivot table.
 */
class ApifyCandidateImporter
{
    public function __construct(private CandidateScoringService $scorer) {}

    /**
     * Import all candidates from a succeeded Apify run.
     * Skips individual candidates that fail to upsert or score, logging a warning instead.
     *
     * @param  ApifyRun  $run  A run with status 'succeeded'.
     * @return int Number of candidates successfully imported.
     */
    public function import(ApifyRun $run): int
    {
        $items = $this->fetchDataset($run->run_id);
        $brief = $run->brief;
        $count = 0;

        foreach ($items as $item) {
            try {
                $candidate = $this->upsertCandidate($item);
                $result = $this->scorer->score($brief, $candidate);

                $brief->candidates()->syncWithoutDetaching([
                    $candidate->id => [
                        'score' => $result['score'],
                        'score_breakdown' => json_encode($result['breakdown']),
                        'sourced_at' => now(),
                    ],
                ]);

                $count++;
            } catch (\Throwable $e) {
                \Log::warning("Failed to import candidate: {$e->getMessage()}", [
                    'item' => $item['linkedinUrl'] ?? 'unknown',
                ]);
            }
        }

        return $count;
    }

    /**
     * Insert or update a Candidate record from raw Apify profile data.
     * Uses linkedin_url as the unique key.
     *
     * @param  array  $item  Raw profile object from the Apify dataset.
     * @return Candidate The upserted candidate.
     */
    private function upsertCandidate(array $item): Candidate
    {
        return Candidate::updateOrCreate(
            ['linkedin_url' => $item['linkedinUrl'] ?? null],
            [
                'full_name' => trim(($item['firstName'] ?? '').' '.($item['lastName'] ?? '')),
                'headline' => $item['headline'] ?? null,
                'location' => $item['location']['linkedinText'] ?? null,
                'summary' => $item['about'] ?? null,
                'skills' => collect($item['skills'] ?? [])->pluck('name')->values()->toArray(),
                'current_company' => $item['currentPosition'][0]['companyName'] ?? null,
                'current_title' => $item['currentPosition'][0]['title'] ?? null,
                'experience_years' => $this->calculateTotalExperience($item['experience'] ?? []),
                'education_level' => $this->extractHighestDegree($item['education'] ?? []),
                'open_to_work' => $item['openToWork'] ?? false,
                'source' => 'apify',
                'raw_data' => $item,
            ]
        );
    }

    /**
     * Sum all experience entry durations into a total years float.
     * Parses Apify duration strings like "2 yrs", "1 yr 2 mos", "5 mos".
     *
     * @param  array  $experiences  Array of experience objects from the Apify profile.
     * @return float|null Total years rounded to 1 decimal, or null if no data.
     */
    private function calculateTotalExperience(array $experiences): ?float
    {
        if (empty($experiences)) {
            return null;
        }

        $totalMonths = 0;

        foreach ($experiences as $exp) {
            $duration = $exp['duration'] ?? '';
            preg_match('/(\d+)\s*yr/', $duration, $years);
            preg_match('/(\d+)\s*mo/', $duration, $months);
            $totalMonths += (int) ($years[1] ?? 0) * 12;
            $totalMonths += (int) ($months[1] ?? 0);
        }

        return $totalMonths > 0 ? round($totalMonths / 12, 1) : null;
    }

    /**
     * Find the highest academic degree across all education entries.
     * Matches degree strings against a ranked keyword list and returns
     * the raw degree string of the highest-ranked match.
     *
     * Rank order: certificate/diploma=1, associate=2, bachelor/bsc=3, master/msc/mba=4, phd/doctor=5
     *
     * @param  array  $education  Array of education objects from the Apify profile.
     * @return string|null Raw degree string of the highest degree found, or null.
     */
    private function extractHighestDegree(array $education): ?string
    {
        $degreeRank = [
            'doctor' => 5, 'phd' => 5,
            'master' => 4, 'msc' => 4, 'mba' => 4,
            'bachelor' => 3, 'bsc' => 3,
            'associate' => 2,
            'diploma' => 1, 'certificate' => 1,
        ];

        $highest = null;
        $highestRank = 0;

        foreach ($education as $edu) {
            $degree = strtolower($edu['degree'] ?? '');
            foreach ($degreeRank as $keyword => $rank) {
                if (str_contains($degree, $keyword) && $rank > $highestRank) {
                    $highest = $edu['degree'];
                    $highestRank = $rank;
                }
            }
        }

        return $highest;
    }

    /**
     * Fetch all items from an Apify run's dataset.
     *
     * @param  string  $runId  The Apify run ID.
     * @return array Array of raw profile objects, empty on failure.
     */
    private function fetchDataset(string $runId): array
    {
        $response = Http::withToken(config('services.apify.token'))
            ->get("https://api.apify.com/v2/actor-runs/{$runId}/dataset/items", [
                'format' => 'json',
                'clean' => true,
            ]);

        return $response->json() ?? [];
    }
}
