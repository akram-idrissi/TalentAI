<?php

namespace App\Http\Controllers\Sourcing;

use App\Http\Controllers\Controller;
use App\Models\Brief;
use App\Models\Candidat;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

            // Always load briefs for the select input
            $briefs = Brief::query()
                ->select('id', 'title')
                ->latest()
                ->get();

            $candidats = null;

            if ($briefId) {
                $candidats = Candidat::query()
                    ->select('candidats.*', 'bc.score', 'bc.score_breakdown', 'bc.sourced_at')
                    ->join('brief_candidat as bc', 'bc.candidat_id', '=', 'candidats.id')
                    ->where('bc.brief_id', $briefId)
                    ->latest('bc.sourced_at')
                    ->paginate(10)
                    ->through(fn ($candidat) => [
                        'id' => $candidat->id,
                        'full_name' => $candidat->full_name,
                        'linkedin_url' => $candidat->linkedin_url,
                        'current_title' => $candidat->current_title,
                        'current_company' => $candidat->current_company,
                        'location' => $candidat->location,
                        'experience_years' => $candidat->experience_years,
                        'status' => $candidat->status,
                        'score' => $candidat->score,
                        'score_breakdown' => $candidat->score_breakdown,
                        'sourced_at' => optional($candidat->sourced_at)?->toDateTimeString(),
                    ]);
            }

            $logger->log(
                'sourcing.index',
                'Consultation des candidats sourcés par brief.',
                ['brief_id' => $briefId],
                [Candidat::class, Brief::class]
            );

            return Inertia::render('Sourcing/Index', [
                'briefs' => $briefs,
                'candidats' => $candidats,
                'filters' => [
                    'brief_id' => $briefId,
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
}
