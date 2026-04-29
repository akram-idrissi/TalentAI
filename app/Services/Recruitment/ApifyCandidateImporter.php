<?php

namespace App\Services\Recruitment;

use App\Models\ApifyRun;
use App\Models\Candidate;
use Illuminate\Support\Facades\Http;

class ApifyCandidateImporter
{
    public function __construct(private CandidateScoringService $scorer) {}

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

                \Log::warning("Failed to import candidate: {$e->getMessage()}", ['item' => $item['linkedinUrl'] ?? 'unknown']);
            }
        }

        return $count;
    }

    private function upsertCandidate(array $item): Candidate
    {
        return Candidate::updateOrCreate(
            // Unique key: LinkedIn URL
            ['linkedin_url' => $item['linkedinUrl'] ?? null],
            [
                'full_name' => trim(($item['firstName'] ?? '').' '.($item['lastName'] ?? '')),
                'headline' => $item['headline'] ?? null,

                // location.linkedinText is the raw string e.g. "Los Angeles, California, United States"
                'location' => $item['location']['linkedinText'] ?? null,

                // about = LinkedIn "summary" section
                'summary' => $item['about'] ?? null,

                // skills is an array of { name, positions, endorsements }
                // Store just the names as a flat JSON array
                'skills' => collect($item['skills'] ?? [])
                    ->pluck('name')
                    ->values()
                    ->toArray(),

                'current_company' => $item['currentPosition'][0]['companyName'] ?? null,
                'current_title' => $item['currentPosition'][0]['title'] ?? null,

                'experience_years' => $this->calculateTotalExperience($item['experience'] ?? []),
                'education_level' => $this->extractHighestDegree($item['education'] ?? []),

                // open_to_work is a useful bonus signal
                'open_to_work' => $item['openToWork'] ?? false,

                'source' => 'apify',
                'raw_data' => $item,
            ]
        );
    }

    /**
     * Sum all experience durations from the `duration` string field.
     * The Actor returns strings like "2 yrs", "1 yr 2 mos", "5 mos".
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
     * Pick the highest academic degree found in education entries.
     * Returns a normalized string matching your Brief's education_level values.
     */
    private function extractHighestDegree(array $education): ?string
    {
        $degreeRank = [
            'doctor' => 5,
            'phd' => 5,
            'master' => 4,
            'msc' => 4,
            'mba' => 4,
            'bachelor' => 3,
            'bsc' => 3,
            'associate' => 2,
            'diploma' => 1,
            'certificate' => 1,
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
