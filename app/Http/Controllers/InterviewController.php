<?php

namespace App\Http\Controllers;

use App\Models\Brief;
use App\Models\Candidat;
use App\Models\Interview;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InterviewController extends Controller
{
    /**
     * Display the interviews management page.
     *
     * Fetches all available candidates and briefs
     * required for interview creation.
     */
    public function index(): Response|RedirectResponse
    {
        try {
            // Fetching available real data for dynamic frontend loops
            $candidates = Candidat::select('id', 'full_name')->get();
            $briefs = Brief::select('id', 'title')->get();

            app(ActivityLogger::class)->log(
                'interview.index',
                'Accessed interview management page',
                [
                    'candidate_count' => $candidates->count(),
                    'brief_count' => $briefs->count(),
                ],
                [
                    Candidat::class,
                    Brief::class,
                ]
            );

            return Inertia::render('Interviews/Index', [
                'candidates' => $candidates,
                'briefs' => $briefs,
            ]);
        } catch (\Throwable $e) {
            app(ActivityLogger::class)->log(
                'interview.index.failed',
                'Failed to load interview management page',
                [
                    'error' => $e->getMessage(),
                ]
            );

            return Inertia::render('Fallback', [
                'error' => 'Failed to load interview management page.',
            ]);
        }
    }

    /**
     * Display interview reports and AI analysis results.
     *
     * Retrieves completed interviews with candidate data
     * and formats them for the reports interface.
     */
    public function reports(): Response|RedirectResponse
    {
        try {
            $interviews = Interview::with('candidate')
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($interview) {
                    return [
                        'id' => $interview->id,
                        'candidate_name' => $interview->candidate->full_name ?? 'Unknown',
                        'platform' => $interview->platform,
                        'verdict' => $interview->verdict,
                        'status' => $interview->status,
                        'ai_report' => json_decode($interview->ai_report),
                        'date' => $interview->created_at->format('d M. Y'),
                    ];
                });

            app(ActivityLogger::class)->log(
                'interview.reports',
                'Accessed interview reports page',
                [
                    'interview_count' => $interviews->count(),
                ],
                [
                    Interview::class,
                ]
            );

            return Inertia::render('Interviews/Reports', [
                'interviews' => $interviews,
            ]);
        } catch (\Throwable $e) {
            app(ActivityLogger::class)->log(
                'interview.reports.failed',
                'Failed to load interview reports',
                [
                    'error' => $e->getMessage(),
                ]
            );

            return Inertia::render('Fallback', [
                'error' => 'Failed to load interview reports.',
            ]);
        }
    }

    /**
     * Store a newly uploaded interview recording.
     *
     * Validates the uploaded file, stores the recording,
     * generates a simulated AI report, and creates
     * the interview record in the database.
     */
    public function store(Request $request): RedirectResponse|Response
    {
        try {
            $validated = $request->validate([
                'candidate_id' => 'required|exists:candidats,id',
                'brief_id' => 'required|exists:briefs,id',
                'platform' => 'required|string',
                'file' => 'required|file|mimes:mp4,m4a,wav,mp3|max:512000',
            ]);

            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('interviews', 'public');

                // Mock transcription data for processing simulation
                $mockTranscription = "Bonjour, je suis Karim Benali. J'ai une solide expérience en développement Fullstack Laravel et React. Je suis passionné par l'IA et je cherche à intégrer TalentAI pour relever de nouveaux défis techniques.";

                // Mock AI analysis report structure
                $mockAiReport = [
                    'score' => 85,
                    'summary' => 'Excellent profile with strong technical background.',
                    'strengths' => [
                        'Communication',
                        'Technical Depth',
                        'Vision',
                    ],
                    'warnings' => [
                        'Salary expectations slightly above budget',
                    ],
                ];

                $interview = Interview::create([
                    'candidate_id' => $validated['candidate_id'],
                    'brief_id' => $validated['brief_id'],
                    'platform' => $validated['platform'],
                    'video_path' => $filePath,
                    'transcription' => $mockTranscription,
                    'ai_report' => json_encode($mockAiReport),
                    'verdict' => 'recommended',
                    'status' => 'completed',
                ]);

                app(ActivityLogger::class)->log(
                    'interview.store',
                    'Interview uploaded successfully',
                    [
                        'interview_id' => $interview->id,
                        'platform' => $interview->platform,
                    ],
                    [
                        Interview::class,
                        Candidat::class,
                        Brief::class,
                    ]
                );

                return redirect()
                    ->back()
                    ->with('success', 'Interview uploaded and AI analysis simulated successfully!');
            }

            app(ActivityLogger::class)->log(
                'interview.store.failed',
                'Interview upload failed - file missing'
            );

            return redirect()
                ->back()
                ->with('error', 'Failed to upload the file.');
        } catch (\Throwable $e) {
            app(ActivityLogger::class)->log(
                'interview.store.failed',
                'Failed to store interview',
                [
                    'error' => $e->getMessage(),
                ]
            );

            return Inertia::render('Fallback', [
                'error' => 'Failed to store interview.',
            ]);
        }
    }
}
