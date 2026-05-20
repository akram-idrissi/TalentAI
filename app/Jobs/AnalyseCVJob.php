<?php

namespace App\Jobs;

use App\Models\Brief;
use App\Models\Candidat;
use App\Models\CvAnalysis;
use App\Services\ActivityLogger;
use App\Services\Recruitment\CVParserService;
use App\Services\Recruitment\GeminiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AnalyseCVJob implements ShouldQueue
{
    use Queueable;

    public string $path;

    public string $cvUrl;

    public int $briefId;

    public function __construct(
        string $path,
        string $cvUrl,
        int $briefId
    ) {
        $this->path = $path;
        $this->cvUrl = $cvUrl;
        $this->briefId = $briefId;
    }

    public function handle(
        CVParserService $cvParserService,
        GeminiService $geminiService
    ): void {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        Log::info('JOB RECEIVED', [
            'path' => $this->path,
            'briefId' => $this->briefId,
        ]);
        $logger->log(
            'cv_job.start',
            'Début analyse CV.',
            ['path' => $this->path],
            []
        );

        // 1. GET BRIEF
        $brief = Brief::find($this->briefId);

        Log::info('BRIEF FOUND', [
            'brief' => $brief,
        ]);

        if (! $brief) {

            $logger->log(
                'cv_job.brief_not_found',
                'Brief introuvable.',
                ['brief_id' => $this->briefId],
                []
            );

            return;
        }

        if (! Storage::disk('s3')->exists($this->path)) {

            throw new \Exception(
                'S3 file not found: '.$this->path
            );
        }
        // 2. FULL PATH
        $tempFile = tempnam(
            sys_get_temp_dir(),
            'cv_'
        );

        file_put_contents(
            $tempFile,
            Storage::disk('s3')->get($this->path)
        );

        Log::info('TEMP FILE CREATED', [
            'tempFile' => $tempFile,
        ]);

        $cvText = $cvParserService->extractText(
            $tempFile
        );

        // DELETE TEMP FILE
        unlink($tempFile);

        Log::info('CV TEXT EXTRACTED', [
            'length' => strlen($cvText),
            'preview' => substr($cvText, 0, 300),
        ]);

        if (! $cvText) {
            $logger->log(
                'cv_job.empty_text',
                'Texte CV vide.',
                ['path' => $this->path],
                []
            );

            return;
        }

        // 4. GEMINI ANALYSIS
        Log::info('CALLING GEMINI');

        $analysis = $geminiService->analyseCV($cvText, $brief);

        $logger->log(
            'cv_job.gemini_done',
            'Analyse Gemini terminée.',
            ['brief_id' => $brief->id],
            []
        );

        // 5. CREATE CANDIDATE
        $candidate = Candidat::firstOrCreate(
            [
                'full_name' => $analysis['candidate']['full_name'] ?? 'Unknown',
            ],
            [
                'skills' => $analysis['candidate']['skills'] ?? [],
                'experience_years' => $analysis['candidate']['experience_years'] ?? 0,
                'summary' => $analysis['candidate']['summary'] ?? null,
                'source' => 'cv',
            ]
        );
        if (! $candidate) {
            throw new \Exception(
                'Candidate creation failed'
            );
        }

        Log::info('CANDIDATE CREATED', [
            'candidate_id' => $candidate->id,
        ]);

        $cvAnalysis = CvAnalysis::create([
            'candidate_id' => $candidate->id,
            'brief_id' => $brief->id,
            'extracted_text' => $analysis['structured_cv'] ?? [],
            'cv_file_path' => $this->cvUrl,

            'score_global' => $analysis['global_score'] ?? 0,
            'score_experience' => $analysis['scores']['experience'] ?? 0,
            'score_education' => $analysis['scores']['education'] ?? 0,
            'score_sector' => $analysis['scores']['sector'] ?? 0,
            'score_softskills' => $analysis['scores']['soft_skills'] ?? 0,
            'score_location' => $analysis['scores']['location'] ?? 0,

            'ai_summary' => $analysis['reasoning_fr'] ?? '',
            'ai_summary_en' => $analysis['reasoning_en'] ?? '',
            'ai_tags' => $analysis['matched_skills'] ?? [],

            'analyzed_at' => now(),
        ]);

        if (! $cvAnalysis) {
            throw new \Exception(
                'CV Analysis creation failed'
            );
        }

        $logger->log(
            'cv_job.success',
            'CV analysé avec succès.',
            ['candidate_id' => $candidate->id],
            []
        );

        Log::info('CV ANALYSIS CREATED');

        Log::error('CV ANALYSIS FAILED', [
            'message' => 'An error occurred during CV analysis',
        ]);

    }
}
