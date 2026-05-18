<?php

namespace App\Http\Controllers\CVAnalysis;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyseCVJob;
use App\Models\Brief;
use App\Models\CvAnalysis;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class CVAnalysisController extends Controller
{
    /**
     * Display list of CV analyses.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {

            $search = $request->search;
            $briefId = $request->brief_id;

            $query = CvAnalysis::with(['candidate', 'brief']);

            // SEARCH CANDIDATE NAME
            if ($search) {
                $query->whereHas('candidate', function ($q) use ($search) {
                    $q->where('full_name', 'like', '%'.$search.'%');
                });
            }

            // FILTER BRIEF
            if ($briefId) {
                $query->where('brief_id', $briefId);
            }

            $analyses = $query
                ->latest()
                ->get();

            $briefs = Brief::select('id', 'title')
                ->orderBy('title')
                ->get();

            $logger->log(
                'cv_analysis.index',
                'Consultation des analyses CV.',
                [],
                [CvAnalysis::class]
            );

            return Inertia::render('CVAnalysis/Index', [
                'analyses' => $analyses,
                'briefs' => $briefs,

                'filters' => [
                    'search' => $search,
                    'brief_id' => $briefId,
                ],
            ]);

        } catch (\Throwable $e) {

            $logger->log(
                'cv_analysis.index.error',
                $e->getMessage(),
                ['exception' => $e->getMessage()],
                [CvAnalysis::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Erreur lors du chargement des analyses.',
            ]);
        }
    }

    /**
     * Show form for creating CV analysis.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {

            $briefs = Brief::select('id', 'title')
                ->latest()
                ->get();

            $logger->log(
                'cv_analysis.create',
                'Affichage du formulaire d’analyse CV.',
                [
                    'briefs_count' => $briefs->count(),
                ],
                [Brief::class]
            );

            return Inertia::render('CVAnalysis/Create', [
                'briefs' => $briefs,
            ]);

        } catch (\Throwable $e) {

            $logger->log(
                'cv_analysis.create.error',
                'Erreur affichage formulaire analyse CV : '.$e->getMessage(),
                [
                    'exception' => $e->getMessage(),
                ],
                [Brief::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d’afficher le formulaire d’analyse CV.',
            ]);
        }
    }

    /**
     * Upload and analyze a CV file.
     *
     * @return JsonResponse
     */
    public function upload(Request $request)
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {

            $validator = Validator::make($request->all(), [
                'brief_id' => ['required', 'exists:briefs,id'],
                'cvs' => ['required', 'array', 'max:10'],
                'cvs.*' => ['required', 'mimes:pdf', 'max:2048'],
            ]);

            if ($validator->fails()) {

                $logger->log(
                    'cv_analysis.upload.validation_error',
                    'Validation échouée lors de l’upload CV.',
                    ['errors' => $validator->errors()->toArray()],
                    []
                );

                return back()->with([
                    'analysis_errors' => $validator->errors()->toArray(),
                    'success' => 0,
                    'total' => 0,
                ]);
            }

            $errors = [];
            $success_count = 0;
            $files = $request->file('cvs') ?? [];
            $total = count($files);

            foreach ($files as $file) {

                try {

                    $path = $file->store(
                        'cvs',
                        's3'
                    );
                    $url = Storage::disk('s3')
                        ->url($path);

                    AnalyseCVJob::dispatchSync(
                        $path,
                        $url,
                        $request->brief_id
                    );

                    $success_count++;

                } catch (\Throwable $e) {

                    $errors[] = [
                        'file' => $file->getClientOriginalName(),
                        'message' => $e->getMessage(),
                    ];

                    $logger->log(
                        'cv_analysis.file_error',
                        'Erreur analyse CV fichier.',
                        [
                            'file' => $file->getClientOriginalName(),
                            'error' => $e->getMessage(),
                        ],
                        []
                    );
                }
            }

            $logger->log(
                'cv_analysis.upload',
                "Upload CV terminé ({$success_count}/{$total})",
                [
                    'success_count' => $success_count,
                    'total' => $total,
                    'errors' => $errors,
                ],
                [CvAnalysis::class]
            );

            return back()->with([
                'analysis_errors' => $errors,
                'success_count' => $success_count,
                'total' => $total,
                'success' => $success_count > 0 ? 'Upload terminé avec succès.' : null,
            ]);

        } catch (\Throwable $e) {

            $logger->log(
                'cv_analysis.upload.error',
                $e->getMessage(),
                ['exception' => $e->getMessage()],
                []
            );

            return back()->with([
                'analysis_errors' => [[
                    'file' => null,
                    'message' => 'Erreur serveur : '.$e->getMessage(),
                ]],
                'success_count' => 0,
                'total' => 0,
            ]);
        }
    }
}
