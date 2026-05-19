<?php

namespace App\Http\Controllers\CVAnalysis;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyseCVJob;
use App\Models\Brief;
use App\Models\CvAnalysis;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
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
                $query = CvAnalysis::query()
                    ->with([
                        'candidate',
                        'brief',
                    ]);

                $filters = $request->input('filters', []);

                if (is_string($filters)) {
                    $filters = json_decode($filters, true);
                }

                if (is_array($filters) && count($filters) > 0) {

                    foreach ($filters as $filter) {

                        if (
                            !isset($filter['field']) ||
                            !isset($filter['value']) ||
                            $filter['value'] === ''
                        ) {
                            
                            continue;
                        }

                        $field = $filter['field'];
                        $value = trim($filter['value']);

                        if ($field === 'full_name') {

                            $query->whereHas('candidate', function ($q) use ($value) {
                                $q->where('full_name', 'LIKE', "%{$value}%");
                            });

                            continue;
                        }

                        if ($field === 'brief') {

                            $query->where('brief_id', $value);

                            continue;
                        }
                        if ($field === 'score') {

                            $query->where('score_global', '>=', (int) $value);

                            continue;
                        }

                        if ($field === 'extracted_text.technical_skills') {

                            $skills = preg_split('/\s+/', trim($value)); 
                            

                            $query->where(function ($q) use ($skills) {

                                foreach ($skills as $skill) {
                                    $q->orWhereJsonContains('extracted_text->technical_skills', $skill);
                                }

                            });
                            continue;
                        }

                        
                    }
                }

                $analyses = $query
                    ->latest()
                    ->get()
                    ->map(function ($analysis) {

                        return [

                            'id' => $analysis->id,

                            'candidate' => [
                                'id' => $analysis->candidate?->id,
                                'full_name' => $analysis->candidate?->full_name,
                                'linkedin_url' => $analysis->candidate?->linkedin_url,
                            ],

                            'brief' => [
                                'id' => $analysis->brief?->id,
                                'title' => $analysis->brief?->title,
                                'required_skills' => $analysis->brief?->required_skills,
                            ],

                            'score_global' => $analysis->score_global,
                            'score_experience' => $analysis->score_experience,
                            'score_education' => $analysis->score_education,
                            'score_skills' => $analysis->score_skills,
                            'ai_summary' => $analysis->ai_summary,
                            'ai_summary_en' => $analysis->ai_summary_en,
                            'ai_tags' => $analysis->ai_tags,
                            'cv_file_path' => $analysis->cv_file_path,
                            'extracted_text' => $analysis->extracted_text,
                            'created_at' => $analysis->created_at?->toDateTimeString(),
                        ];
                    });

                $briefs = Brief::select('id', 'title')
                    ->orderBy('title')
                    ->get();
                $logger->log(
                    'cv_analysis.index',
                    'Consultation des analyses CV.',
                    [
                        'filters' => $filters,
                    ],
                    [CvAnalysis::class]
                );
                return Inertia::render('CVAnalysis/Index', [
                    'analyses' => $analyses,
                    'briefs' => $briefs,
                    'filters' => $filters,
                ]);

            } catch (\Throwable $e) {

                $logger->log(
                    'cv_analysis.index.error',
                    $e->getMessage(),
                    [
                        'exception' => $e->getMessage(),
                    ],
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
                    'briefs_count' => $briefs->count()
                ],
                [Brief::class]
            );

            return Inertia::render('CVAnalysis/Create', [
                'briefs' => $briefs,
            ]);

        } catch (\Throwable $e) {

            $logger->log(
                'cv_analysis.create.error',
                'Erreur affichage formulaire analyse CV : ' . $e->getMessage(),
                [
                    'exception' => $e->getMessage()
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
     * @return \Illuminate\Http\JsonResponse
     */

    public function upload(Request $request)
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {

            $validator = Validator::make($request->all(), [
                'brief_id' => ['required', 'exists:briefs,id'],
                'cvs' => ['required', 'array' ,'max:10'],
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
                            'error' => $e->getMessage()
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
                    'errors' => $errors
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
                    'message' => 'Erreur serveur : ' . $e->getMessage()
                ]],
                'success_count' => 0,
                'total' => 0,
            ]);
        }
    }
}