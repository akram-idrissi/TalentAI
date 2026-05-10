<?php

namespace App\Http\Controllers\Sourcing;

use App\Http\Controllers\Controller;
use App\Models\Brief;
use App\Models\UserApiToken;
use App\Services\ActivityLogger;
use App\Services\Recruitment\ApifyCandidateImporter;
use App\Services\Recruitment\ApifyJobDispatcher;
use App\Services\Recruitment\BriefToQueryConverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SourcingController extends Controller
{
    /**
     * Display candidats for a selected brief with their sourcing scores.
     *
     * Query params:
     * - brief_id (optional): selected brief
     */
    public function index(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $briefId = $request->get('brief_id');

            $briefs = Brief::query()
                ->select('id', 'title')
                ->latest()
                ->get();

            $logger->log(
                'sourcing.index',
                'Consultation de la page sourcing.',
                ['brief_id' => $briefId],
                [Brief::class]
            );

            return Inertia::render('Sourcing/Index', [
                'briefs' => $briefs,
                'filters' => [
                    'brief_id' => $briefId ? (int) $briefId : null,
                ],
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'sourcing.index.error',
                'Erreur lors de la récupération du sourcing : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Candidat::class, Brief::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger les données de sourcing.',
            ]);
        }
    }

    /**
     * SSE stream: if the brief already has candidates return them from DB instantly,
     * otherwise trigger an Apify run, poll until done, import + score, then stream
     * each candidate as a separate SSE event.
     *
     * Events emitted:
     *   event: status   data: {"message":"..."}
     *   event: candidate data: {...candidat fields...}
     *   event: error    data: {"message":"..."}
     *   event: done     data: {}
     */
    public function stream(
        Request $request,
        BriefToQueryConverter $converter,
        ApifyJobDispatcher $dispatcher,
        ApifyCandidateImporter $importer,
    ): StreamedResponse {
        $briefId = (int) $request->query('brief_id');

        // Release the session lock so other requests aren't blocked during the long-running stream
        request()->session()->save();

        return response()->stream(function () use ($briefId, $converter, $dispatcher, $importer) {
            // Helpers to write SSE frames
            $emit = function (string $event, array $data) {
                echo "event: {$event}\n";
                echo 'data: '.json_encode($data)."\n\n";
                ob_flush();
                flush();
            };

            set_time_limit(600);

            $brief = Brief::find($briefId);

            if (! $brief) {
                $emit('error', ['message' => 'Brief introuvable.']);
                $emit('done', []);

                return;
            }

            // Resolve the user's Apify token
            $tokenRecord = UserApiToken::where('user_id', auth()->id())
                ->where('provider', 'apify')
                ->first();

            $token = $tokenRecord?->token ?? config('services.apify.token');

            if (! $token) {
                $emit('error', ['message' => 'Aucune clé API Apify configurée. Ajoutez-la dans les intégrations.']);
                $emit('done', []);

                return;
            }

            // If candidates already exist for this brief, stream them from DB
            $existingCount = $brief->candidates()->count();

            if ($existingCount > 0) {
                $emit('status', ['message' => 'cached']);

                $brief->candidates()
                    ->select('candidats.*', 'bc.score', 'bc.score_breakdown', 'bc.sourced_at')
                    ->join('brief_candidat as bc', 'bc.candidat_id', '=', 'candidats.id')
                    ->where('bc.brief_id', $briefId)
                    ->orderByDesc('bc.sourced_at')
                    ->each(function ($c) use ($emit) {
                        $emit('candidate', [
                            'id' => $c->id,
                            'full_name' => $c->full_name,
                            'linkedin_url' => $c->linkedin_url,
                            'current_title' => $c->current_title,
                            'current_company' => $c->current_company,
                            'location' => $c->location,
                            'experience_years' => $c->experience_years,
                            'status' => $c->status,
                            'score' => $c->score,
                            'score_breakdown' => is_string($c->score_breakdown) ? json_decode($c->score_breakdown, true) : $c->score_breakdown,
                            'sourced_at' => optional($c->sourced_at)?->toDateTimeString(),
                        ]);
                    });

                $emit('done', []);

                return;
            }

            // No candidates yet — run Apify
            try {
                $emit('status', ['message' => 'starting']);

                $query = $converter->convert($brief);
                $run = $dispatcher->dispatch($brief, $query, $token);

                $emit('status', ['message' => 'running']);

                // Poll Apify until the run finishes (max ~8 min, 5s interval)
                $maxAttempts = 96;
                $attempt = 0;
                $runStatus = 'RUNNING';

                while ($attempt < $maxAttempts) {
                    sleep(5);
                    $attempt++;

                    $pollResponse = Http::withToken($token)
                        ->get("https://api.apify.com/v2/actor-runs/{$run->run_id}");

                    if ($pollResponse->failed()) {
                        continue;
                    }

                    $runStatus = $pollResponse->json('data.status');

                    if (in_array($runStatus, ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'])) {
                        break;
                    }

                    // Heartbeat every ~30s so the connection stays alive
                    if ($attempt % 6 === 0) {
                        $emit('status', ['message' => 'polling']);
                    }
                }

                if ($runStatus !== 'SUCCEEDED') {
                    $run->update(['status' => 'failed']);
                    $emit('error', ['message' => "Le run Apify a échoué ({$runStatus})."]);
                    $emit('done', []);

                    return;
                }

                $run->update(['status' => 'succeeded']);

                $emit('status', ['message' => 'importing']);

                $count = $importer->streamImport($run, $token, function (array $candidate) use ($emit) {
                    $emit('candidate', $candidate);
                });

                $run->update(['candidates_imported' => $count]);

                $emit('done', []);

            } catch (\Throwable $e) {
                logger()->error('SourcingController::stream failed', ['error' => $e->getMessage()]);
                $emit('error', ['message' => 'Une erreur est survenue : '.$e->getMessage()]);
                $emit('done', []);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
