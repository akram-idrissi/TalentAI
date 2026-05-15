<?php

namespace App\Jobs\Transcription;

use App\Models\Transcription;
use App\Services\Transcription\AssemblyAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class TranscribeAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1800;

    public int $tries = 1;

    public function __construct(
        private readonly Transcription $transcription
    ) {}

    // Laravel resolves AssemblyAIService automatically from the service container
    public function handle(AssemblyAIService $assemblyAI): void
    {
        $this->transcription->update(['status' => 'processing']);

        $audioPath = Storage::path($this->transcription->audio_path);

        // A = first speaker detected = Interviewer
        // B = second speaker detected = Candidate
        $speakerMap = [
            'A' => 'Interviewer',
            'B' => 'Candidate',
        ];

        $utterances = $assemblyAI->transcribeAndDiarize($audioPath);

        $turns = [];
        foreach ($utterances as $u) {
            if (trim($u['text']) === '') {
                continue;
            }

            $turns[] = [
                'speaker' => $speakerMap[$u['speaker']] ?? $u['speaker'],
                'text' => $u['text'],
            ];
        }

        $rawTranscript = implode(' ', array_column($turns, 'text'));
        $diarizedTranscript = implode("\n\n", array_map(
            fn ($t) => "{$t['speaker']}: {$t['text']}",
            $turns
        ));

        $this->transcription->update([
            'status' => 'done',
            'transcript_text' => $rawTranscript,
            'diarized_transcript' => $diarizedTranscript,
        ]);

        // Audio no longer needed once transcribed
        // Storage::delete($this->transcription->audio_path);
    }

    public function failed(Throwable $e): void
    {
        Log::error('TranscribeAudioJob failed', [
            'transcription_id' => $this->transcription->id,
            'error' => $e->getMessage(),
        ]);

        $this->transcription->update([
            'status' => 'failed',
            'error' => $e->getMessage(),
        ]);

        // Storage::delete($this->transcription->audio_path);
    }
}
