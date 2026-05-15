<?php

namespace App\Http\Controllers;

use App\Jobs\Transcription\TranscribeAudioJob;
use App\Models\Transcription;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TranscriptionController extends Controller
{
    /**
     * Display the transcription index page.
     *
     * @return Response Inertia page — Transcription/Index — or Fallback on failure
     */
    public function index(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'transcription.index',
                'Affichage de la page de transcription.',
                [],
                [Transcription::class]
            );

            return Inertia::render('Transcription/Index');
        } catch (\Throwable $e) {
            $logger->log(
                'transcription.index.error',
                'Erreur lors de l\'affichage de la page de transcription : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Transcription::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher la page de transcription.',
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
    public function transcribe(Request $request): RedirectResponse|Response
    {
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
            ]);

            $path = $request->file('audio')->store('transcriptions/pending', 'local');

            $transcription = Transcription::create([
                'status' => 'pending',
                'audio_path' => $path,
            ]);

            TranscribeAudioJob::dispatch($transcription);

            try {
                $logger->log(
                    'transcription.transcribe',
                    "Transcription soumise (ID : {$transcription->id}).",
                    ['transcription_id' => $transcription->id, 'audio_path' => $path],
                    [Transcription::class]
                );
            } catch (\Throwable) {
            }

            return back()->with('id', $transcription->id);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'transcription.transcribe.error',
                'Erreur lors de la soumission de la transcription : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Transcription::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de soumettre la transcription.',
            ]);
        }
    }

    /**
     * Return the current status and result of the specified transcription as JSON.
     *
     * @param  Transcription  $transcription  Route-model-bound Transcription instance
     * @return JsonResponse|Response JSON payload with id, status, diarized_transcript, and error — or Fallback on failure
     */
    public function show(Transcription $transcription): JsonResponse|Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'transcription.show',
                "Consultation de la transcription (ID : {$transcription->id}).",
                ['transcription_id' => $transcription->id],
                [Transcription::class]
            );

            return response()->json([
                'id' => $transcription->id,
                'status' => $transcription->status,
                'diarized_transcript' => $transcription->diarized_transcript,
                'error' => $transcription->error,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'transcription.show.error',
                "Erreur lors de la consultation de la transcription (ID : {$transcription->id}) : ".$e->getMessage(),
                ['transcription_id' => $transcription->id, 'exception' => $e->getMessage()],
                [Transcription::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher cette transcription.',
            ]);
        }
    }
}
