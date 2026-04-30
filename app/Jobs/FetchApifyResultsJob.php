<?php

namespace App\Jobs;

use App\Models\ApifyRun;
use App\Services\Recruitment\ApifyCandidateImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

/**
 * Polls an Apify run until it succeeds or fails.
 * Re-queues itself every 60 seconds, up to 20 attempts (~20 minutes total).
 * On success, delegates candidate import and scoring to ApifyCandidateImporter.
 * Handles Apify rate limits by releasing back to the queue for 1 hour.
 */
class FetchApifyResultsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int Maximum number of polling attempts before Laravel marks the job as failed. */
    public int $tries = 20;

    /** @var int Seconds to wait between polling attempts. */
    public int $backoff = 60;

    /**
     * @param  ApifyRun  $run  The Apify run to poll.
     */
    public function __construct(public ApifyRun $run) {}

    /**
     * Poll the Apify run status and react accordingly.
     * - SUCCEEDED  → import candidates and mark run as succeeded.
     * - RUNNING / READY / ABORTING → release back to queue after $backoff seconds.
     * - 429 or rate-limited statusMessage → release for 1 hour.
     * - Any other status → mark run as failed and fail the job.
     *
     * @param  ApifyCandidateImporter  $importer  Handles dataset fetching, upsert, and scoring.
     */
    public function handle(ApifyCandidateImporter $importer): void
    {
        $response = Http::withToken(config('services.apify.token'))
            ->get("https://api.apify.com/v2/actor-runs/{$this->run->run_id}");

        if ($response->status() === 429) {
            $this->release(3600);

            return;
        }

        $data = $response->json('data');
        $status = $data['status'] ?? 'FAILED';

        if (($data['statusMessage'] ?? '') === 'rate limited') {
            $this->release(3600);

            return;
        }

        match ($status) {
            'SUCCEEDED' => $this->handleSuccess($importer),
            'RUNNING', 'READY', 'ABORTING' => $this->release($this->backoff),
            default => $this->handleFailure($status),
        };
    }

    /**
     * Import candidates from the completed run and update the run record.
     */
    private function handleSuccess(ApifyCandidateImporter $importer): void
    {
        $count = $importer->import($this->run);
        $this->run->update(['status' => 'succeeded', 'candidates_imported' => $count]);
    }

    /**
     * Mark the run as failed and fail the job with a descriptive message.
     *
     * @param  string  $status  The terminal status returned by Apify (e.g. 'ABORTED', 'TIMED-OUT').
     */
    private function handleFailure(string $status): void
    {
        $this->run->update(['status' => 'failed']);
        $this->fail("Apify run {$this->run->run_id} ended with: {$status}");
    }

    /**
     * Fetch the raw Apify run status string.
     * Not used in the main flow but kept as a utility for debugging/testing.
     *
     * @param  string  $runId  The Apify run ID.
     * @return string One of: READY, RUNNING, SUCCEEDED, FAILED, ABORTING, ABORTED, TIMED-OUT.
     */
    private function checkApifyStatus(string $runId): string
    {
        $response = Http::withToken(config('services.apify.token'))
            ->get("https://api.apify.com/v2/actor-runs/{$runId}");

        return $response->json('data.status', 'FAILED');
    }
}
