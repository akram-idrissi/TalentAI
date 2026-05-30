<?php

namespace App\Services\Transcription;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AssemblyAIService
{
    private const BASE_URL = 'https://api.assemblyai.com/v2';

    private function headers(): array
    {
        return [
            'Authorization' => config('services.assemblyai.key'),
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Submit a transcription job using a pre-signed S3 URL. Returns the AssemblyAI transcript ID.
     */
    public function submit(string $audioUrl): string
    {
        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->post(self::BASE_URL.'/transcript', [
                'audio_url' => $audioUrl,
                'speech_models' => ['universal-3-pro', 'universal-2'],
                'speaker_labels' => true,
                'speakers_expected' => 2,
            ]);

        if ($response->failed()) {
            throw new RuntimeException('AssemblyAI submit failed: '.$response->body());
        }

        $id = $response->json('id');

        if (! $id) {
            throw new RuntimeException('AssemblyAI did not return a transcript ID.');
        }

        return $id;
    }

    /**
     * Check the current status of a transcript. Returns 'queued', 'processing', 'completed', or 'error'.
     */
    public function checkStatus(string $transcriptId): string
    {
        $response = Http::withHeaders($this->headers())
            ->timeout(15)
            ->get(self::BASE_URL.'/transcript/'.$transcriptId);

        if ($response->failed()) {
            throw new RuntimeException('AssemblyAI status check failed: '.$response->body());
        }

        return $response->json('status') ?? 'error';
    }

    /**
     * Fetch the completed transcript and return parsed utterances.
     * Only call this when checkStatus() returns 'completed'.
     */
    public function fetchUtterances(string $transcriptId): array
    {
        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->get(self::BASE_URL.'/transcript/'.$transcriptId);

        if ($response->failed()) {
            throw new RuntimeException('AssemblyAI fetch failed: '.$response->body());
        }

        $utterances = $response->json('utterances') ?? [];

        if (empty($utterances)) {
            throw new RuntimeException('AssemblyAI returned no utterances.');
        }

        return array_map(fn ($u) => [
            'speaker' => $u['speaker'],
            'start' => $u['start'],
            'end' => $u['end'],
            'text' => trim($u['text']),
        ], $utterances);
    }
}
