<?php

namespace App\Jobs\Transcription;

use App\Models\Brief;
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
        $this->transcription->refresh();
        $this->transcription->update(['status' => 'processing']);
        $this->transcription->interview->update(['status' => 'transcribing']);

        $audioPath = Storage::path($this->transcription->audio_path);

        $this->transcription->loadMissing('interview.brief');
        $interview = $this->transcription->interview;

        if (! $interview || ! $interview->brief) {
            throw new \RuntimeException(
                "Transcription {$this->transcription->id} has no linked interview or brief."
            );
        }

        $brief = $this->formatBrief(
            $interview->brief,
            $interview->expectations
        );

        // Get diarized utterances FIRST
        $utterances = $assemblyAI->transcribeAndDiarize($audioPath);

        // A = first detected speaker = Interviewer
        $firstSpeaker = $utterances[0]['speaker'] ?? 'A';

        $speakerMap = [
            $firstSpeaker => 'Interviewer',
        ];

        // Remaining speakers = Candidate
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
            array_map(
                fn ($t) => "{$t['speaker']}: {$t['text']}",
                $turns
            )
        );

        $this->transcription->update([
            'status' => 'done',
            'transcript_text' => $rawTranscript,
            'diarized_transcript' => $diarizedTranscript,
        ]);

        $this->transcription->interview->update([
            'status' => 'analyzed',
        ]);

        try {
            AnalyseTranscriptionJob::dispatch(
                $this->transcription,
                $brief,
                []
            );
        } catch (Throwable $e) {
            Log::error('Failed to dispatch AnalyseTranscriptionJob', [
                'transcription_id' => $this->transcription->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }

        Storage::delete($this->transcription->audio_path);
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
        $this->transcription->interview->update(['status' => 'recording_uploaded']);

        Storage::delete($this->transcription->audio_path);
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
        $salary = $brief->salary_range ?? 'Non précisé';
        $sector = $brief->sector ?? 'Non précisé';
        $location = $brief->location ?? 'Non précisé';
        $experience = $brief->min_experience_years ?? 'Non précisé';
        $education = $brief->education_level ?? 'Non précisé';
        $seniority = $brief->seniority_level ?? 'Non précisé';

        return <<<BRIEF
Poste : {$brief->title}
Secteur : {$sector}
Contrat : {$brief->contract_type?->label()}
Lieu : {$location}
Salaire : {$salary}
Expérience minimale : {$experience} an(s)
Niveau d'études : {$education}
Langues : {$langs}
Séniorité : {$seniority}
Préférence genre : {$brief->gender_pref}
Tranche d'âge : {$brief->age_range}

Mission :
{$brief->mission_description}

Compétences techniques requises : {$skills}
Compétences comportementales : {$soft}

Pondération des critères d'évaluation : {$weights}{$expectationsSection}
BRIEF;
    }
}
