<?php

namespace App\Jobs;

use App\Models\ApifyRun;
use App\Models\UserApiToken;
use App\Services\Recruitment\ApifyCandidateImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

/**
 * Polls an Apify run and imports candidates incrementally while the run is in progress.
 *
 * Design:
 *   - $tries = 1: the job never auto-retries on exception; it self-dispatches with delay instead.
 *   - Re-dispatches itself every POLL_INTERVAL seconds until the run reaches a terminal state.
 *   - Checks ApifyRun.status = 'paused' before each cycle so the user can stop mid-run.
 *   - Imports dataset items in pages of PAGE_SIZE, advancing dataset_offset after each page.
 *   - On SUCCEEDED, does a final fetch to capture any remaining tail items.
 */
class ApifySourceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 120;

    private const POLL_INTERVAL = 15;

    private const PAGE_SIZE = 25;

    public function __construct(public int $runId) {}

    public function handle(ApifyCandidateImporter $importer): void
    {
        $run = ApifyRun::with('brief')->find($this->runId);

        if (! $run || in_array($run->status, ['succeeded', 'failed', 'paused'])) {
            return;
        }

        $token = $this->resolveToken($run);

        if (! $token) {
            $run->update(['status' => 'failed']);
            logger()->error('ApifySourceJob: no token available', ['run_id' => $run->id]);

            return;
        }

        // Poll Apify for current run status
        try {
            $response = Http::withToken($token)
                ->timeout(15)
                ->get("https://api.apify.com/v2/actor-runs/{$run->run_id}");
        } catch (\Throwable $e) {
            logger()->warning('ApifySourceJob: Apify poll failed, retrying', ['error' => $e->getMessage()]);
            static::dispatch($this->runId)->delay(self::POLL_INTERVAL);

            return;
        }

        if ($response->status() === 429) {
            logger()->warning('ApifySourceJob: rate limited, backing off 5 minutes');
            static::dispatch($this->runId)->delay(300);

            return;
        }

        if ($response->failed()) {
            static::dispatch($this->runId)->delay(self::POLL_INTERVAL);

            return;
        }

        $data = $response->json('data') ?? [];
        $apifyStatus = $data['status'] ?? 'FAILED';
        $datasetId = $data['defaultDatasetId'] ?? null;

        // Persist dataset_id the first time we see it
        if ($datasetId && ! $run->dataset_id) {
            $run->update(['dataset_id' => $datasetId]);
            $run->dataset_id = $datasetId;
        }

        // Track total items available in the dataset
        $totalItems = $data['stats']['itemCount'] ?? null;
        if ($totalItems !== null && $totalItems !== $run->total_items) {
            $run->update(['total_items' => $totalItems]);
        }

        // Import whatever is in the dataset so far (works mid-run)
        if ($run->dataset_id) {
            $run->refresh();
            if ($run->status !== 'paused') {
                $this->importPage($run, $importer, $token);
            }
        }

        // Re-check pause (user may have paused while we were importing)
        $run->refresh();
        if ($run->status === 'paused') {
            return;
        }

        match ($apifyStatus) {
            'SUCCEEDED' => $this->onSuccess($run, $importer, $token),
            'FAILED', 'ABORTED', 'TIMED-OUT' => $run->update(['status' => 'failed']),
            default => static::dispatch($this->runId)->delay(self::POLL_INTERVAL),
        };
    }

    private function importPage(ApifyRun $run, ApifyCandidateImporter $importer, string $token): void
    {
        $fetched = $importer->importPage($run, $token, self::PAGE_SIZE);

        if ($fetched > 0) {
            $run->increment('dataset_offset', $fetched);
            $run->refresh();
        }
    }

    private function onSuccess(ApifyRun $run, ApifyCandidateImporter $importer, string $token): void
    {
        // Drain any remaining tail items after the run completed
        do {
            $fetched = $importer->importPage($run, $token, self::PAGE_SIZE);
            if ($fetched > 0) {
                $run->increment('dataset_offset', $fetched);
                $run->refresh();
            }
        } while ($fetched === self::PAGE_SIZE);

        $run->update(['status' => 'succeeded']);

        // Advance the brief's pagination pointer so the next run fetches fresh pages
        $takePages = $run->search_params['takePages'] ?? 4;
        $startPage = $run->search_params['startPage'] ?? 1;
        $run->brief?->update(['next_start_page' => $startPage + $takePages]);

        logger()->info('ApifySourceJob: run succeeded', [
            'run_id' => $run->id,
            'candidates_imported' => $run->candidates_imported,
            'next_start_page' => $startPage + $takePages,
        ]);
    }

    private function resolveToken(ApifyRun $run): ?string
    {
        if ($run->user_id) {
            $token = UserApiToken::where('user_id', $run->user_id)
                ->where('provider', 'apify')
                ->value('token');

            if ($token) {
                return $token;
            }
        }

        return config('services.apify.token') ?: null;
    }
}
