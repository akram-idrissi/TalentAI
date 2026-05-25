<?php

namespace App\Http\Controllers\Interview;

use App\Http\Controllers\Controller;
use App\Models\Brief;
use App\Models\Transcription;
use App\Services\ActivityLogger;
use App\Services\Transcription\AssemblyAIService;
use App\Services\Transcription\TranscriptionAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscriptionWebhookController extends Controller
{
    /**
     * Handle an incoming AssemblyAI transcription webhook.
     *
     * @param  Request  $request  Incoming webhook payload
     * @param  AssemblyAIService  $assemblyAI  AssemblyAI service
     * @param  TranscriptionAnalysisService  $analysisService  Analysis service
     */
    public function handle(
        Request $request,
        AssemblyAIService $assemblyAI,
        TranscriptionAnalysisService $analysisService
    ): JsonResponse {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        // Verify the secret token embedded in the webhook URL
        $expectedSecret = config('services.assemblyai.webhook_secret');
        if (! hash_equals((string) $expectedSecret, (string) $request->query('secret', ''))) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->json()->all();
        $status = $payload['status'] ?? '';

        // Only process completed transcriptions
        if ($status !== 'completed') {
            if ($status === 'error') {
                $this->markFailed(
                    (int) $request->query('transcription_id'),
                    $payload['error'] ?? 'AssemblyAI transcription error'
                );
            }

            return response()->json(['ok' => true]);
        }

        $transcriptionId = (int) $request->query('transcription_id');
        $transcription = Transcription::with('interview.brief')->find($transcriptionId);

        if (! $transcription) {
            Log::error('AssemblyAI webhook: transcription not found', ['transcription_id' => $transcriptionId]);

            return response()->json(['error' => 'Transcription not found'], 404);
        }

        // Parse utterances from the webhook payload
        try {
            $utterances = $assemblyAI->parseWebhookPayload($payload);
        } catch (\Throwable $e) {
            Log::error('AssemblyAI webhook: failed to parse utterances', [
                'transcription_id' => $transcriptionId,
                'error' => $e->getMessage(),
            ]);
            $this->markFailed($transcriptionId, $e->getMessage());

            return response()->json(['ok' => true]);
        }

        // Map speakers: first detected speaker = Interviewer, rest = Candidate
        $firstSpeaker = $utterances[0]['speaker'] ?? 'A';
        $speakerMap = [$firstSpeaker => 'Interviewer'];
        foreach ($utterances as $u) {
            if (! isset($speakerMap[$u['speaker']])) {
                $speakerMap[$u['speaker']] = 'Candidate';
            }
        }

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
        $diarizedTranscript = implode(
            "\n\n",
            array_map(fn ($t) => "{$t['speaker']}: {$t['text']}", $turns)
        );

        $transcription->update([
            'status' => 'done',
            'transcript_text' => $rawTranscript,
            'diarized_transcript' => $diarizedTranscript,
        ]);
        $transcription->interview->update(['status' => 'analyzed']);

        // Clean up the uploaded audio file from S3
        if ($transcription->audio_path) {
            Storage::disk('s3')->delete($transcription->audio_path);
        }

        // Respond 200 to AssemblyAI immediately, then continue processing
        if (function_exists('fastcgi_finish_request')) {
            fastcgi_finish_request();
        }

        // Run analysis synchronously now that the HTTP response is flushed
        try {
            $interview = $transcription->interview;
            $brief = $this->formatBrief($interview->brief, $interview->expectations ?? '');

            $transcription->update(['analysis_status' => 'processing']);

            $result = $analysisService->analyse($diarizedTranscript, $brief);

            $transcription->update([
                'analysis_status' => 'done',
                'analysis_score' => $result['global_score'],
                'analysis_verdict' => $result['verdict'],
                'analysis_result' => $result,
            ]);
            $interview->update(['status' => 'done']);

            Log::info('TranscriptionWebhookController: analysis complete', [
                'transcription_id' => $transcription->id,
                'score' => $result['global_score'],
            ]);
        } catch (\Throwable $e) {
            Log::error('TranscriptionWebhookController: analysis failed', [
                'transcription_id' => $transcription->id,
                'error' => $e->getMessage(),
            ]);

            $transcription->update([
                'analysis_status' => 'failed',
                'analysis_error' => $e->getMessage(),
            ]);
            $transcription->interview->update(['status' => 'analyzed']);
        }

        $logger->log('transcription.webhook', 'Webhook AssemblyAI traité.', ['transcription_id' => $transcription->id ?? null], [Transcription::class]);

        return response()->json(['ok' => true]);
    }

    private function markFailed(int $transcriptionId, string $error): void
    {
        $transcription = Transcription::find($transcriptionId);
        if (! $transcription) {
            return;
        }

        $transcription->update(['status' => 'failed', 'error' => $error]);
        $transcription->interview?->update(['status' => 'recording_uploaded']);

        if ($transcription->audio_path) {
            Storage::disk('s3')->delete($transcription->audio_path);
        }
    }

    private function formatBrief(Brief $brief, string $expectations): string
    {
        $skills = is_array($brief->required_skills) ? implode(', ', $brief->required_skills) : $brief->required_skills;
        $soft = is_array($brief->soft_skills) ? implode(', ', $brief->soft_skills) : $brief->soft_skills;
        $langs = is_array($brief->languages) ? implode(', ', $brief->languages) : $brief->languages;
        $weights = is_array($brief->scoring_weights)
            ? collect($brief->scoring_weights)->map(fn ($v, $k) => "{$k}: {$v}%")->implode(', ')
            : $brief->scoring_weights;

        $expectationsSection = $expectations
            ? "\n\nAttentes spécifiques de l'interviewer :\n{$expectations}"
            : '';

        $sector = $brief->sector ?? 'Non précisé';
        $contractType = $brief->contract_type?->label();
        $location = $brief->location ?? 'Non précisé';
        $salary = $brief->salary_range ?? 'Non précisé';
        $experience = $brief->min_experience_years ?? 'Non précisé';
        $education = $brief->education_level ?? 'Non précisé';
        $seniority = $brief->seniority_level ?? 'Non précisé';
        $genderPref = $brief->gender_pref;
        $ageRange = $brief->age_range;
        $mission = $brief->mission_description;
        $title = $brief->title;

        return <<<BRIEF
            Poste : {$title}
            Secteur : {$sector}
            Contrat : {$contractType}
            Lieu : {$location}
            Salaire : {$salary}
            Expérience minimale : {$experience} an(s)
            Niveau d'études : {$education}
            Langues : {$langs}
            Séniorité : {$seniority}
            Préférence genre : {$genderPref}
            Tranche d'âge : {$ageRange}

            Mission :
            {$mission}

            Compétences techniques requises : {$skills}
            Compétences comportementales : {$soft}

            Pondération des critères d'évaluation : {$weights}{$expectationsSection}
        BRIEF;
    }
}
