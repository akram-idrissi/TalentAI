<?php

namespace App\Services\Transcription;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AssemblyAIService
{
    private const BASE_URL = 'https://api.assemblyai.com/v2';

    private const POLL_INTERVAL = 5;  // seconds

    private const MAX_WAIT = 1800; // 30 min

    private function headers(): array
    {
        return [
            'Authorization' => config('services.assemblyai.key'),
            'Content-Type' => 'application/json',
        ];
    }

    public function transcribeAndDiarize(string $audioPath): array
    {
        $uploadUrl = $this->uploadFile($audioPath);
        $transcriptId = $this->submitTranscription($uploadUrl);
        $result = $this->pollUntilDone($transcriptId);

        return $this->parseUtterances($result);
    }

    // Step 1 — upload raw audio bytes directly to AssemblyAI
    private function uploadFile(string $audioPath): string
    {
        $response = Http::withHeaders([
            'Authorization' => config('services.assemblyai.key'),
            'Content-Type' => 'application/octet-stream',
        ])
            ->timeout(120)
        // ->withBody(file_get_contents($audioPath), 'application/octet-stream')
            ->withBody(fopen($audioPath, 'r'), 'application/octet-stream')
            ->post(self::BASE_URL.'/upload');

        if ($response->failed()) {
            throw new RuntimeException('AssemblyAI upload failed: '.$response->body());
        }

        $url = $response->json('upload_url');

        if (! $url) {
            throw new RuntimeException('AssemblyAI did not return an upload URL.');
        }

        return $url;
    }

    // Step 2 — submit transcription job with speaker diarization
    private function submitTranscription(string $audioUrl): string
    {
        $response = Http::withHeaders($this->headers())
            ->timeout(30)
            ->post(self::BASE_URL.'/transcript', [
                'audio_url' => $audioUrl,
                'speech_models' => ['universal-3-pro', 'universal-2'],
                'speaker_labels' => true,
                'speakers_expected' => 2,
                // 'language_code'  => 'fr', // uncomment if needed, or remove for auto-detect
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

    // Step 3 — poll until status is completed or error
    private function pollUntilDone(string $transcriptId): array
    {
        $waited = 0;

        while ($waited < self::MAX_WAIT) {
            sleep(self::POLL_INTERVAL);
            $waited += self::POLL_INTERVAL;

            $response = Http::withHeaders($this->headers())
                ->timeout(30)
                ->get(self::BASE_URL.'/transcript/'.$transcriptId);

            if ($response->failed()) {
                throw new RuntimeException('AssemblyAI poll failed: '.$response->body());
            }

            $status = $response->json('status');

            if ($status === 'completed') {
                return $response->json();
            }

            if ($status === 'error') {
                throw new RuntimeException('AssemblyAI transcription error: '.$response->json('error'));
            }

            // status is 'queued' or 'processing' — keep polling
        }

        throw new RuntimeException('AssemblyAI timed out after '.self::MAX_WAIT.'s.');
    }

    // Step 4 — extract utterances from the completed response
    // AssemblyAI utterances are already grouped speaker turns — better than raw words
    private function parseUtterances(array $result): array
    {
        $utterances = $result['utterances'] ?? [];

        if (empty($utterances)) {
            throw new RuntimeException('AssemblyAI returned no utterances.');
        }

        return array_map(fn ($u) => [
            'speaker' => $u['speaker'], // "A" or "B"
            'start' => $u['start'],   // milliseconds
            'end' => $u['end'],
            'text' => trim($u['text']),
        ], $utterances);
    }
}
