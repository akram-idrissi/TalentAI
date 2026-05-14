<?php

namespace App\Http\Controllers;

use App\Models\Candidat;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InterviewController extends Controller
{
    /**
     * Display the interviews management page (Module 4 Index)
     * Fetches candidates from the 'candidats' table for selection.
     */
    public function index()
    {
        return Inertia::render('Interviews/Index', [
            'candidates' => Candidat::select('id', 'full_name')->get(),
        ]);
    }

    /**
     * Display the AI Reports and Comparative Ranking (Module 3.4)
     * Fetches all completed interviews with their associated candidate.
     */
    public function reports()
    {
        // 1. Fetching interviews with candidate details from DB [cite: 110]
        $interviews = Interview::with('candidate')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($interview) {
                return [
                    'id' => $interview->id,
                    'candidate_name' => $interview->candidate->full_name ?? 'Unknown',
                    'platform' => $interview->platform,
                    'verdict' => $interview->verdict, // From Module 3.2 [cite: 97]
                    'status' => $interview->status,
                    'ai_report' => json_decode($interview->ai_report), // From Module 3.2 [cite: 92]
                    'date' => $interview->created_at->format('d M. Y'),
                ];
            });

        // 2. Rendering the Reports.tsx page [cite: 108]
        return Inertia::render('Interviews/Reports', [
            'interviews' => $interviews,
        ]);
    }

    /**
     * Handle the recording upload and simulate AI processing (Step 4.1 & 4.2)
     * Validates file type and size (500MB max) as per specs. [cite: 72]
     */
    public function store(Request $request)
    {
        // 1. Validation Logic (500 MB max) [cite: 72]
        $request->validate([
            'candidate_id' => 'required|exists:candidats,id',
            'platform' => 'required|string',
            'file' => 'required|file|mimes:mp4,m4a,wav,mp3|max:512000',
        ]);

        if ($request->hasFile('file')) {
            // 2. Storage Logic
            $filePath = $request->file('file')->store('interviews', 'public');

            /**
             * 3. Simulated AI Pipeline (Mocking Whisper & Claude) [cite: 70, 77]
             * This allows you to bypass the "Insufficient Balance" error for now.
             */

            // Mock Transcription text [cite: 74]
            $mockTranscription = "Bonjour, je suis Karim Benali. J'ai une solide expérience en développement Fullstack Laravel et React. Je suis passionné par l'IA et je cherche à intégrer TalentAI pour relever de nouveaux défis techniques.";

            // Mock AI Report (JSON format consistent with functional specs) [cite: 92, 102]
            $mockAiReport = [
                'score' => 85,
                'summary' => 'Excellent profile with strong technical background.',
                'strengths' => ['Communication', 'Technical Depth', 'Vision'],
                'warnings' => ['Salary expectations slightly above budget'],
            ];

            // 4. Create the interview record with complete data [cite: 73]
            $interview = Interview::create([
                'candidate_id' => $request->candidate_id,
                'platform' => $request->platform,
                'video_path' => $filePath,
                'transcription' => $mockTranscription, // Simulated output [cite: 74]
                'ai_report' => json_encode($mockAiReport), // Simulated report [cite: 92]
                'verdict' => 'recommended', // Simulated verdict [cite: 97]
                'status' => 'completed',
            ]);

            return redirect()->back()->with('success', 'Interview uploaded and AI analysis simulated successfully!');
        }

        return redirect()->back()->with('error', 'Failed to upload the file.');
    }
}
