<?php

namespace App\Http\Controllers\Interview;

use App\Enums\BriefStatus;
use App\Http\Controllers\Controller;
use App\Models\Brief;
use App\Models\Candidat;
use App\Models\Interview;
use App\Models\Transcription;
use App\Services\ActivityLogger;
use App\Services\Transcription\AssemblyAIService;
use App\Services\Transcription\TranscriptionAnalysisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    /**
     * Display the transcription index page.
     *
     * @return Response Inertia page — Transcription/Index — or Fallback on failure
     */
    public function create(): Response
    {
        $this->authorize('interviews.create');

        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'interview.index',
                'Affichage de la page d\'entretien.',
                [],
                [Interview::class]
            );

            return Inertia::render('Interview/Create', [
                'candidates' => Candidat::select('id', 'full_name')->orderBy('full_name')->get(),
                'briefs' => Brief::select('id', 'title')->where('status', BriefStatus::Active)->orderBy('title')->get(),
                'interviews' => Interview::with(['candidate', 'transcription'])
                    ->where('interviewer_id', auth()->id())
                    ->latest('scheduled_at')
                    ->take(10)
                    ->get()
                    ->map(fn ($i) => [
                        'id' => $i->id,
                        'candidate_name' => $i->candidate?->full_name ?? '—',
                        'platform' => $i->platform,
                        'scheduled_at' => $i->scheduled_at?->format('d M Y'),
                        'transcription_status' => $i->transcription?->status ?? 'none',
                        'transcription_id' => $i->transcription?->id,
                        'analysis_status' => $i->transcription?->analysis_status ?? 'none',
                    ]),
            ]);
        } catch (\Throwable $e) {

            $logger->log(
                'interview.index.error',
                'Erreur lors de l\'affichage de la page d\'entretien : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Interview::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher la page d\'entretien.',
            ]);
        }
    }

    /**
     * Paginated list of all interviews for the authenticated user.
     */
    public function index(): Response
    {
        $this->authorize('interviews.view');

        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {

            $filters = json_decode(request('filters', '[]'), true);

            $query = Interview::with(['candidate', 'brief', 'transcription'])
                ->where('interviewer_id', auth()->id());

            foreach ($filters as $filter) {

                if ($filter['field'] === 'candidate') {
                    $query->whereHas('candidate', function ($q) use ($filter) {
                        $q->where(
                            'full_name',
                            'like',
                            '%'.$filter['value'].'%',
                        );
                    });
                }

                if ($filter['field'] === 'brief') {
                    $query->whereHas('brief', function ($q) use ($filter) {
                        $q->where(
                            'title',
                            'like',
                            '%'.$filter['value'].'%',
                        );
                    });
                }

                if ($filter['field'] === 'platform') {
                    $query->where(
                        'platform',
                        $filter['value'],
                    );
                }

                if ($filter['field'] === 'status') {
                    $query->whereHas('transcription', function ($q) use ($filter) {
                        $q->where(
                            'status',
                            $filter['value'],
                        );
                    });
                }
            }

            $interviews = $query
                ->latest('scheduled_at')
                ->paginate(10)
                ->through(fn ($i) => [
                    'id' => $i->id,
                    'candidate_name' => $i->candidate?->full_name ?? '—',
                    'brief_title' => $i->brief?->title ?? '—',
                    'platform' => $i->platform,
                    'scheduled_at' => $i->scheduled_at?->format('d M Y'),
                    'transcription_status' => $i->transcription?->status ?? 'none',
                    'transcription_id' => $i->transcription?->id,
                    'analysis_status' => $i->transcription?->analysis_status ?? 'none',
                ]);

            $logger->log(
                'interview.list',
                'Liste des entretiens consultée.',
                [],
                [Interview::class]
            );

            return Inertia::render('Interview/Index', [
                'interviews' => $interviews,
                'filters' => $filters,
            ]);

        } catch (\Throwable $e) {

            $logger->log(
                'interview.list.error',
                'Erreur lors de la récupération des entretiens : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Interview::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger les entretiens.',
            ]);
        }
    }

    /**
     * Validate and store an uploaded audio file, then dispatch a transcription job.
     *
     * @param  Request  $request  Must contain an `audio` file (mp3/wav/mp4/m4a, max 80 MB)
     * @return RedirectResponse|Response Redirects back with the transcription ID on success, or renders Fallback on unexpected failure
     *
     * @throws ValidationException If validation fails (auto-handled by Laravel)
     */
    public function upload(Request $request, AssemblyAIService $assemblyAI): RedirectResponse|Response
    {
        $this->authorize('interviews.upload');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'audio' => [
                    'required',
                    'file',
                    'mimetypes:audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/m4a,audio/x-m4a',
                    'max:81920',
                ],
                'candidate_id' => ['required', 'integer', 'exists:candidats,id'],
                'brief_id' => ['required', 'integer', 'exists:briefs,id'],
                'platform' => ['required', 'string', 'in:zoom,meet,teams,presentiel'],
                'expectations' => ['nullable', 'string', 'max:2000'],
            ]);

            $interview = Interview::create([
                'candidate_id' => $request->candidate_id,
                'brief_id' => $request->brief_id,
                'interviewer_id' => auth()->user()->id,
                'platform' => $request->platform,
                'status' => 'recording_uploaded',
                'expectations' => $request->expectations,
                'scheduled_at' => now(),
            ]);

            $path = $request->file('audio')->store('transcriptions/pending', 's3');

            $transcription = Transcription::create([
                'interview_id' => $interview->id,
                'status' => 'pending',
                'audio_path' => $path,
            ]);

            // Pre-signed URL valid for 1 hour — long enough for AssemblyAI to fetch the file
            $presignedUrl = Storage::disk('s3')->temporaryUrl($path, now()->addHour());

            $assemblyTranscriptId = $assemblyAI->submit($presignedUrl);

            $transcription->update(['assemblyai_transcript_id' => $assemblyTranscriptId]);

            $logger->log(
                'interview.upload',
                "Transcription soumise à AssemblyAI (ID : {$transcription->id}, AssemblyAI : {$assemblyTranscriptId}).",
                ['transcription_id' => $transcription->id, 'assemblyai_transcript_id' => $assemblyTranscriptId],
                [Transcription::class]
            );

            return back()->with('interview_id', $interview->id);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'interview.upload.error',
                'Erreur lors de la soumission de l\'entretien : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Interview::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de soumettre l\'entretien.',
            ]);
        }
    }

    /**
     * Display a single interview with its transcription and analysis details.
     *
     * @param  Interview  $interview  Interview to display
     * @return Response Inertia page — Interview/Show — or Fallback on failure
     */
    public function show(Interview $interview): Response
    {
        $this->authorize('interviews.view');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $interview->load(['candidate', 'brief', 'transcription', 'interviewer']);

            $logger->log(
                'interview.show',
                "Consultation de l'entretien (ID : {$interview->id}).",
                ['interview_id' => $interview->id],
                [Interview::class]
            );

            $transcription = $interview->transcription;

            $analysis = $transcription?->analysis_result ?? [];

            $diarized = $transcription?->diarized_transcript;
            if (is_string($diarized) && ! empty($diarized)) {

                $decoded = json_decode($diarized, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $diarized = $decoded;
                } else {

                    $diarized = collect(preg_split('/\n{2,}/', trim($diarized)))
                        ->filter()
                        ->map(function (string $block) {

                            $parts = explode(': ', $block, 2);

                            return count($parts) === 2
                                ? ['speaker' => trim($parts[0]), 'text' => trim($parts[1])]
                                : ['speaker' => 'Unknown',       'text' => trim($block)];
                        })
                        ->values()
                        ->all();
                }
            } else {
                $diarized = [];
            }

            return Inertia::render('Interview/Show', [
                'interview' => [
                    'id' => $interview->id,
                    'candidate_name' => $interview->candidate?->full_name ?? '—',
                    'brief_title' => $interview->brief?->title ?? '—',
                    'platform' => $interview->platform,
                    'scheduled_at' => $interview->scheduled_at?->format('d M Y'),
                    'interviewer' => $interview->interviewer?->name ?? '—',
                ],
                'transcription' => $transcription ? [
                    'id' => $transcription->id,
                    'status' => $transcription->status,
                    'analysis_status' => $transcription->analysis_status,
                    'analysis_score' => $transcription->analysis_score,
                    'analysis_verdict' => $transcription->analysis_verdict,
                    'global_score' => $analysis['global_score'] ?? null,
                    'verdict' => $analysis['verdict'] ?? null,
                    'criteria' => $analysis['criteria'] ?? [],
                    'strengths' => $analysis['strengths'] ?? [],
                    'red_flags' => $analysis['red_flags'] ?? [],
                    'key_excerpts' => $analysis['key_excerpts'] ?? [],
                    'diarized_transcript' => $diarized ?? [],
                ] : null,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'interview.show.error',
                "Erreur lors de la consultation de l'entretien (ID : {$interview->id}) : ".$e->getMessage(),
                ['interview_id' => $interview->id, 'exception' => $e->getMessage()],
                [Interview::class]
            );

            return Inertia::render('Fallback', [
                'error' => "Impossible d'afficher cet entretien.",
            ]);
        }
    }

    /**
     * Return the transcription and analysis status for an interview.
     *
     * @param  Interview  $interview  Interview being tracked
     * @return JsonResponse Current processing status, or an error payload on failure
     */
    public function status(Interview $interview, AssemblyAIService $assemblyAI, TranscriptionAnalysisService $analysisService): JsonResponse
    {
        $this->authorize('interviews.view');

        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $interview->load(['transcription', 'brief']);
            $transcription = $interview->transcription;

            if (! $transcription) {
                return response()->json(['status' => 'pending', 'analysis_status' => 'pending']);
            }

            // If transcription is still pending, check AssemblyAI for updates
            if ($transcription->status === 'pending' && $transcription->assemblyai_transcript_id) {
                $assemblyStatus = $assemblyAI->checkStatus($transcription->assemblyai_transcript_id);

                if ($assemblyStatus === 'completed') {
                    // Fetch and process utterances
                    $utterances = $assemblyAI->fetchUtterances($transcription->assemblyai_transcript_id);

                    $firstSpeaker = $utterances[0]['speaker'] ?? 'A';
                    $speakerMap = [$firstSpeaker => 'Interviewer'];
                    foreach ($utterances as $u) {
                        if (! isset($speakerMap[$u['speaker']])) {
                            $speakerMap[$u['speaker']] = 'Candidate';
                        }
                    }

                    $turns = array_filter(
                        array_map(fn ($u) => trim($u['text']) === '' ? null : [
                            'speaker' => $speakerMap[$u['speaker']] ?? $u['speaker'],
                            'text' => $u['text'],
                        ], $utterances)
                    );

                    $diarizedTranscript = implode("\n\n", array_map(fn ($t) => "{$t['speaker']}: {$t['text']}", $turns));

                    $transcription->update([
                        'status' => 'done',
                        'transcript_text' => implode(' ', array_column($turns, 'text')),
                        'diarized_transcript' => $diarizedTranscript,
                        'analysis_status' => 'processing',
                    ]);

                    Storage::disk('s3')->delete($transcription->audio_path);

                    // Run analysis — extend PHP time limit for this request
                    @set_time_limit(300);

                    try {
                        $brief = $this->formatBrief($interview->brief, $interview->expectations ?? '');
                        $result = $analysisService->analyse($diarizedTranscript, $brief);

                        $transcription->update([
                            'analysis_status' => 'done',
                            'analysis_score' => $result['global_score'],
                            'analysis_verdict' => $result['verdict'],
                            'analysis_result' => $result,
                        ]);
                        $interview->update(['status' => 'done']);
                    } catch (\Throwable $e) {
                        $transcription->update(['analysis_status' => 'failed', 'analysis_error' => $e->getMessage()]);
                    }

                    $transcription->refresh();

                } elseif ($assemblyStatus === 'error') {
                    $transcription->update(['status' => 'failed']);
                }
            }

            $logger->log('interview.status', 'Consultation du statut de transcription.', ['interview_id' => $interview->id], [Interview::class]);

            return response()->json([
                'status' => $transcription->status,
                'analysis_status' => $transcription->analysis_status ?? 'pending',
                'error' => $transcription->error ?? null,
            ]);
        } catch (\Throwable $e) {
            $logger->log('interview.status.error', 'Erreur lors de la récupération du statut : '.$e->getMessage(), ['exception' => $e->getMessage()], [Interview::class]);

            return response()->json([
                'status' => 'failed',
                'analysis_status' => 'failed',
                'error' => $e->getMessage(),
            ], 500);
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
        $contract = $brief->contract_type?->label();
        $location = $brief->location ?? 'Non précisé';
        $salary = $brief->salary_range ?? 'Non précisé';
        $experience = $brief->min_experience_years ?? 'Non précisé';
        $education = $brief->education_level ?? 'Non précisé';
        $seniority = $brief->seniority_level ?? 'Non précisé';
        $gender = $brief->gender_pref;
        $age = $brief->age_range;
        $mission = $brief->mission_description;
        $title = $brief->title;

        return <<<BRIEF
Poste : {$title}
Secteur : {$sector}
Contrat : {$contract}
Lieu : {$location}
Salaire : {$salary}
Expérience minimale : {$experience} an(s)
Niveau d'études : {$education}
Langues : {$langs}
Séniorité : {$seniority}
Préférence genre : {$gender}
Tranche d'âge : {$age}

Mission :
{$mission}

Compétences techniques requises : {$skills}
Compétences comportementales : {$soft}

Pondération des critères d'évaluation : {$weights}{$expectationsSection}
BRIEF;
    }
}
