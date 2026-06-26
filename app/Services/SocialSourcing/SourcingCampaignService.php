<?php

namespace App\Services\SocialSourcing;

use Illuminate\Support\Facades\Http;

class SourcingCampaignService
{
    protected string $token;

    protected string $baseUrl = 'https://api.apify.com/v2';

    public function __construct()
    {
        $this->token = config('services.apify.token');
    }

    // -------------------------------------------------------------------------
    // Posts + comments scraper
    // -------------------------------------------------------------------------

    public function startRun(array $targetUrls, int $maxPosts): array
    {
        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/acts/harvestapi~linkedin-company-posts/runs", [
                'targetUrls' => $targetUrls,
                'maxPosts' => $maxPosts,
            ]);

        return $response->json();
    }

    public function getRun(string $runId): array
    {
        return Http::withToken($this->token)
            ->get("{$this->baseUrl}/actor-runs/{$runId}")
            ->json('data', []);
    }

    public function getDatasetItems(string $datasetId): array
    {
        return Http::withToken($this->token)
            ->get("{$this->baseUrl}/datasets/{$datasetId}/items", [
                'format' => 'json',
                'clean' => true,
            ])
            ->json() ?? [];
    }
}
