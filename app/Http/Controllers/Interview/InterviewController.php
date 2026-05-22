<?php

namespace App\Http\Controllers\Interview;

use App\Enums\BriefStatus;
use App\Http\Controllers\Controller;
use App\Jobs\Transcription\TranscribeAudioJob;
use App\Models\Brief;
use App\Models\Candidat;
use App\Models\Interview;
use App\Models\Transcription;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            $interviews = Interview::with(['candidate', 'brief', 'transcription'])
                ->where('interviewer_id', auth()->id())
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

            $logger->log('interview.list', 'Liste des entretiens consultée.', [], [Interview::class]);

            return Inertia::render('Interview/Index', [
                'interviews' => $interviews,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'interview.list.error',
                'Erreur lors de la liste des entretiens : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Interview::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher la liste des entretiens.',
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
    public function upload(Request $request): RedirectResponse|Response
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

            $path = $request->file('audio')->store('transcriptions/pending', 'local');

            $transcription = Transcription::create([
                'interview_id' => $interview->id,
                'status' => 'pending',
                'audio_path' => $path,
            ]);

            TranscribeAudioJob::dispatch($transcription);

            $logger->log(
                'interview.upload',
                "Transcription soumise (ID : {$transcription->id}).",
                ['transcription_id' => $transcription->id, 'audio_path' => $path],
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

    public function status(Interview $interview): JsonResponse
    {
        $this->authorize('interviews.view');
        $interview->load('transcription');
        $transcription = $interview->transcription;

        return response()->json([
            'status' => $transcription?->status ?? 'pending',
            'analysis_status' => $transcription?->analysis_status ?? 'pending',
            'error' => $transcription?->error ?? null,
        ]);
    }
}
