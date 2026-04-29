<?php

use App\Models\ApifyRun;
use App\Services\Recruitment\ApifyCandidateImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class FetchApifyResultsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 20;

    public int $backoff = 60;

    public function __construct(public ApifyRun $run) {}

    private function checkApifyStatus(string $runId): string
    {
        $response = Http::withToken(config('services.apify.token'))
            ->get("https://api.apify.com/v2/actor-runs/{$runId}");

        return $response->json('data.status', 'FAILED');
    }

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

    private function handleSuccess(ApifyCandidateImporter $importer): void
    {
        $count = $importer->import($this->run);
        $this->run->update(['status' => 'succeeded', 'candidates_imported' => $count]);
    }

    private function handleFailure(string $status): void
    {
        $this->run->update(['status' => 'failed']);
        $this->fail("Apify run {$this->run->run_id} ended with: {$status}");
    }
}
