<?php

namespace App\Http\Controllers;

use App\Models\Brief;
use App\Models\Candidat;
use App\Models\Interview; // 1. Imported the Brief Model
use Illuminate\Http\Request;
use Inertia\Inertia;

class InterviewController extends Controller
{
    /**
     * Display the interviews management page (Module 4 Index)
     * Fetches candidates and briefs from the database for dropdown selection.
     */
    public function index()
    {
        return Inertia::render('Interviews/Index', [
            'candidates' => Candidat::select('id', 'full_name')->get(),
            'briefs' => Brief::select('id', 'title')->get(), // 2. Passing briefs list to Inertia frontend
        ]);
    }

    /**
     * Display the AI Reports and Comparative Ranking (Module 3.4)
     * Fetches all completed interviews with their associated candidate.
     */
    public function reports()
    {
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

        return Inertia::render('Interviews/Reports', [
            'interviews' => $interviews,
        ]);
    }

    /**
     * Handle the recording upload and simulate AI processing (Step 4.1 & 4.2)
     * Validates file type, size, and now binds the interview to an associated job brief.
     */
    public function store(Request $request)
    {
        // 3. Added 'brief_id' validation as per structural requirements
        $request->validate([
            'candidate_id' => 'required|exists:candidats,id',
            'brief_id' => 'required|exists:briefs,id', // Validating that the job brief exists
            'platform' => 'required|string',
            'file' => 'required|file|mimes:mp4,m4a,wav,mp3|max:512000',
        ]);

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('interviews', 'public');

            // Mock Transcription text
            $mockTranscription = "Bonjour, je suis Karim Benali. J'ai une solide expérience en développement Fullstack Laravel et React. Je suis passionné par l'IA et je cherche à intégrer TalentAI pour relever de nouveaux défis techniques.";

            // Mock AI Report (JSON format consistent with functional specs)
            $mockAiReport = [
                'score' => 85,
                'summary' => 'Excellent profile with strong technical background.',
                'strengths' => ['Communication', 'Technical Depth', 'Vision'],
                'warnings' => ['Salary expectations slightly above budget'],
            ];

            // 4. Create the interview record with complete data, including brief_id
            $interview = Interview::create([
                'candidate_id' => $request->candidate_id,
                'brief_id' => $request->brief_id, // Saving the brief relation in database
                'platform' => $request->platform,
                'video_path' => $filePath,
                'transcription' => $mockTranscription,
                'ai_report' => json_encode($mockAiReport),
                'verdict' => 'recommended',
                'status' => 'completed',
            ]);

            return redirect()->back()->with('success', 'Interview uploaded and AI analysis simulated successfully!');
        }

        return redirect()->back()->with('error', 'Failed to upload the file.');
    }
}
