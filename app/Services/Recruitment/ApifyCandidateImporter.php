<?php

namespace App\Services\Recruitment;

use App\Models\ApifyRun;
use App\Models\Candidate;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Fetches scraped LinkedIn profiles from a completed Apify run,
 * upserts them as Candidate records, scores all of them in one batched
 * AI call via CandidateScoringService::scoreBatch(), and attaches them
 * to the brief via the pivot table.
 */
class ApifyCandidateImporter
{
    public function __construct(private CandidateScoringService $scorer) {}

    /**
     * Import all candidates from a succeeded Apify run.
     *
     * Flow:
     *   1. Fetch dataset items from Apify.
     *   2. Upsert all valid items as Candidate records (skipping failures individually).
     *   3. Score the whole batch in ONE AI call.
     *   4. Attach each candidate to the brief with score + breakdown.
     *
     * @param  ApifyRun  $run  A run with status 'succeeded'.
     * @return int Number of candidates successfully imported and scored.
     */
    public function import(ApifyRun $run): int
    {
        $items = $this->fetchDataset($run->run_id);
        $brief = $run->brief;

        if (empty($items)) {
            return 0;
        }

        // --- Step 1: Upsert all candidates, collecting the ones that succeed. ---
        $candidates = collect();

        foreach ($items as $item) {
            try {
                $candidates->push($this->upsertCandidate($item));
            } catch (\Throwable $e) {
                Log::warning('Failed to upsert candidate, skipping.', [
                    'linkedin_url' => $item['linkedinUrl'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($candidates->isEmpty()) {
            return 0;
        }

        // --- Step 2: Score the whole batch in a single AI call. ---
        $scores = $this->scorer->scoreBatch($brief, $candidates);

        // --- Step 3: Attach each candidate to the brief. ---
        $count = 0;

        foreach ($candidates as $candidate) {
            $key = $candidate->linkedin_url ?? $candidates->search($candidate);
            $result = $scores[$key] ?? null;

            if (! $result) {
                Log::warning('No score returned for candidate, skipping pivot attach.', [
                    'linkedin_url' => $candidate->linkedin_url,
                ]);

                continue;
            }

            try {
                $brief->candidates()->syncWithoutDetaching([
                    $candidate->id => [
                        'score' => $result['score'],
                        'score_breakdown' => json_encode($result['breakdown']),
                        'sourced_at' => now(),
                    ],
                ]);
                $count++;
            } catch (\Throwable $e) {
                Log::warning('Failed to attach candidate to brief.', [
                    'candidate_id' => $candidate->id,
                    'error' => $e->getMessage(),
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
     * Note: sums naively — overlapping concurrent roles will inflate the total.
     * Use date-based calculation from raw_data if precision is critical.
     *
     * @return float|null Total years rounded to 1 decimal, or null if no data.
     */
    /**
     * Calculate total non-overlapping experience in years.
     *
     * Strategy (in order of preference):
     *   1. Date-based interval merge — uses startDate/endDate from raw Apify data.
     *      Handles concurrent roles correctly by merging overlapping intervals.
     *   2. Duration string fallback — used only when date fields are absent.
     *      Sums naively (may overcount concurrent roles), but is better than null.
     *
     * @param  array  $experiences  Raw Apify experience objects.
     * @return float|null Total years rounded to 1 decimal, or null if no data.
     */
    private function calculateTotalExperience(array $experiences): ?float
    {
        if (empty($experiences)) {
            return null;
        }

        $intervals = $this->extractDateIntervals($experiences);

        if ($intervals->isNotEmpty()) {
            return $this->sumMergedIntervals($intervals);
        }

        return $this->sumDurationStrings($experiences);
    }

    /**
     * Convert experience entries to [startMonths, endMonths] intervals.
     * Only entries with at least a start year are included.
     * Entries marked isCurrent (or missing endDate) use the current month as end.
     *
     * Absolute months = year * 12 + (month - 1), giving a single integer
     * timeline that makes overlap detection trivial.
     *
     * @return Collection<int, array{0: int, 1: int}>
     */
    private function extractDateIntervals(array $experiences): Collection
    {
        $nowMonths = (int) now()->format('Y') * 12 + ((int) now()->format('n') - 1);

        return collect($experiences)
            ->filter(fn ($exp) => ! empty($exp['startDate']['year']))
            ->map(function ($exp) use ($nowMonths) {
                $startYear = (int) $exp['startDate']['year'];
                $startMonth = (int) ($exp['startDate']['month'] ?? 1) - 1;
                $start = $startYear * 12 + $startMonth;

                $isCurrent = $exp['isCurrent'] ?? empty($exp['endDate']['year']);

                if ($isCurrent) {
                    $end = $nowMonths;
                } else {
                    $endYear = (int) $exp['endDate']['year'];
                    $endMonth = (int) ($exp['endDate']['month'] ?? 12) - 1;
                    $end = $endYear * 12 + $endMonth;
                }

                return $end > $start ? [$start, $end] : null;
            })
            ->filter()
            ->values();
    }

    /**
     * Merge overlapping intervals and sum their lengths.
     *
     * Example — two concurrent roles:
     *   [2021-01, 2023-06]  naive: 30 months
     *   [2022-03, 2024-01]  naive: 22 months  (overlaps above)
     *   Naive sum  = 52 months = 4.3 yrs  (wrong)
     *   After merge: [2021-01, 2024-01] = 36 months = 3.0 yrs  (correct)
     */
    private function sumMergedIntervals(Collection $intervals): float
    {
        $sorted = $intervals->sortBy(fn ($i) => $i[0])->values()->all();

        $merged = [];
        [$curStart, $curEnd] = $sorted[0];

        foreach (array_slice($sorted, 1) as [$start, $end]) {
            if ($start <= $curEnd) {
                $curEnd = max($curEnd, $end);
            } else {
                $merged[] = [$curStart, $curEnd];
                $curStart = $start;
                $curEnd = $end;
            }
        }
        $merged[] = [$curStart, $curEnd];

        $totalMonths = array_sum(array_map(fn ($i) => $i[1] - $i[0], $merged));

        return round($totalMonths / 12, 1);
    }

    /**
     * Naive fallback: sum duration strings when date fields are absent.
     * Parses "2 yrs 3 mos", "1 yr", "5 mos" etc.
     * Will overcount concurrent roles — acceptable only as a last resort.
     */
    private function sumDurationStrings(array $experiences): ?float
    {
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
     * Returns a normalized key compatible with CandidateScoringService's level map.
     *
     * Normalized output values (not raw degree strings):
     *   'phd', 'master', 'mba', 'msc', 'bachelor', 'bsc', 'bac+2', 'bac', 'diploma'
     *
     * Rank order: certificate/diploma=1, bac+2/associate=2, bachelor/bsc=3,
     *             master/msc/mba=4, phd/doctor=5
     */
    private function extractHighestDegree(array $education): ?string
    {
        // Keys are match keywords; values are [rank, normalized_key].
        // Normalized keys must exist in CandidateScoringService::$levels.
        $degreeMap = [
            'doctor' => [5, 'phd'],
            'phd' => [5, 'phd'],
            'master' => [4, 'master'],
            'msc' => [4, 'msc'],
            'mba' => [4, 'mba'],
            'bachelor' => [3, 'bachelor'],
            'bsc' => [3, 'bsc'],
            'licence' => [3, 'licence'],
            'associate' => [2, 'bac+2'],
            'bac+2' => [2, 'bac+2'],
            'diploma' => [1, 'bac'],
            'certificate' => [1, 'bac'],
        ];

        $highestNormalized = null;
        $highestRank = 0;

        foreach ($education as $edu) {
            $degree = strtolower($edu['degree'] ?? '');

            foreach ($degreeMap as $keyword => [$rank, $normalized]) {
                if (str_contains($degree, $keyword) && $rank > $highestRank) {
                    $highestNormalized = $normalized;
                    $highestRank = $rank;
                }
            }
        }

        return $highestNormalized;
    }

    /**
     * Fetch all items from an Apify run's dataset.
     *
     * @return array Raw profile objects, empty on failure.
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
