<?php

namespace App\Jobs\Transcription;

use App\Models\Transcription;
use App\Services\Transcription\TranscriptionAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class AnalyseTranscriptionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;

    public int $tries = 2;

    /**
     * @param  Transcription  $transcription  The completed transcription to analyse
     * @param  string  $brief  The job/role brief used as evaluation reference
     * @param  array<string>  $otherCandidates  Optional fiches of peer candidates for comparison
     */
    public function __construct(
        private readonly Transcription $transcription,
        private readonly string $brief,
        private readonly array $otherCandidates = [],
    ) {}

    /**
     * Laravel resolves TranscriptionAnalysisService automatically from the service container.
     */
    public function handle(TranscriptionAnalysisService $analysisService): void
    {
        if (empty($this->transcription->diarized_transcript)) {
            Log::warning('AnalyseTranscriptionJob: no diarized_transcript, aborting.', [
                'transcription_id' => $this->transcription->id,
            ]);

            $this->transcription->update([
                'analysis_status' => 'failed',
                'analysis_error' => 'diarized_transcript is empty.',
            ]);

            return;
        }

        $this->transcription->update(['analysis_status' => 'processing']);

        $result = $analysisService->analyse(
            $this->transcription->diarized_transcript,
            $this->brief,
            $this->otherCandidates,
        );

        $this->transcription->update([
            'analysis_status' => 'done',
            'analysis_score' => $result['global_score'],
            'analysis_verdict' => $result['verdict'],
            'analysis_result' => $result,
        ]);
        $this->transcription->interview->update(['status' => 'done']);

        Log::info('AnalyseTranscriptionJob: analysis complete', [
            'transcription_id' => $this->transcription->id,
            'score' => $result['global_score'],
            'verdict' => $result['verdict'],
        ]);
    }

    public function failed(Throwable $e): void
    {
        Log::error('AnalyseTranscriptionJob failed', [
            'transcription_id' => $this->transcription->id,
            'error' => $e->getMessage(),
        ]);

        $this->transcription->update([
            'analysis_status' => 'failed',
            'analysis_error' => $e->getMessage(),
        ]);
        $this->transcription->interview->update(['status' => 'analyzed']);
    }
}
