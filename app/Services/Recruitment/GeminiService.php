<?php

namespace App\Services\Recruitment;

use App\Models\Brief;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\ActivityLogger;

class GeminiService
{
    public function analyseCV(string $cvText, Brief $brief): array
    {
            /** @var ActivityLogger $logger */
    $logger = app(ActivityLogger::class);

        try {

            Log::info('GEMINI START');
                    $logger->log(
            'gemini.request',
            'Appel Gemini API',
            [],
            []
        );

            $cvText = substr($cvText, 0, 12000);

            $prompt = <<<PROMPT
            You are an AI recruitment system.

            Return ONLY valid JSON.
            Do NOT return markdown.
            Do NOT omit any field.

            All fields are mandatory.

            You must extract:
            1. Candidate information
            2. Structured CV data
            3. Recruitment scoring

            You must ALWAYS generate:
            - reasoning_fr in French
            - reasoning_en in English

            Return this exact JSON structure:

            {
            "candidate": {
                "full_name": "",
                "email": "",
                "phone": "",
                "skills": [],
                "experience_years": 0,
                "summary": ""
            },

            "structured_cv": {
                "profile": "",
                "education": [
                {
                    "degree": "",
                    "school": "",
                    "year": ""
                }
                ],
                "experiences": [
                {
                    "position": "",
                    "company": "",
                    "duration": "",
                    "description": ""
                }
                ],
                "projects": [
                {
                    "name": "",
                    "description": "",
                    "technologies": []
                }
                ],
                "certifications": [],
                "languages": [],
                "technical_skills": [],
                "soft_skills": []
            },

            "scores": {
                "experience": 0,
                "education": 0,
                "sector": 0,
                "soft_skills": 0,
                "location": 0
            },

            "global_score": 0,

            "matched_skills": [],
            "missing_skills": [],

            "reasoning_fr": "",
            "reasoning_en": ""
            }

            Job Brief:
            {$brief->mission_description}

            Skills Required:
            {$brief->required_skills}

            CV:
            {$cvText}
            PROMPT;

            Log::info('PROMPT READY');

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-goog-api-key' => config('services.gemini.key'),
            ])->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
                [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt
                                ]
                            ]
                        ]
                    ]
                ]
            );

            Log::info('GEMINI STATUS', [
                'status' => $response->status()
            ]);

            Log::info('GEMINI RAW RESPONSE', [
                'body' => $response->body()
            ]);

            if (!$response->successful()) {
                            $logger->log(
                'gemini.error',
                'API Gemini failed',
                ['status' => $response->status()],
                []
            );

                Log::error('Gemini request failed');

                throw new \Exception(
                    'Gemini API error: ' . $response->status()
                );
            }

            $text = data_get(
                $response->json(),
                'candidates.0.content.parts.0.text'
            );

            Log::info('GEMINI TEXT', [
                'text' => $text
            ]);

            if (!$text) {

                Log::error('Gemini returned empty text');

                throw new \Exception('Gemini returned empty response');
            }

            // Remove markdown
            $text = preg_replace('/```json|```/', '', $text);

            preg_match('/\{.*\}/s', $text, $matches);

            if (!isset($matches[0])) {

                Log::error('No JSON found');

                throw new \Exception('No JSON found in Gemini response');
            }

            $decoded = json_decode($matches[0], true);

            Log::info('JSON DECODED', [
                'decoded' => $decoded
            ]);

            if (!is_array($decoded)) {

                Log::error('JSON decode failed');

                throw new \Exception('Failed to decode JSON response');
            }

            return $decoded;

        } catch (\Throwable $e) {

            Log::error('GEMINI EXCEPTION', [
                'message' => $e->getMessage()
            ]);
                    $logger->log(
            'gemini.exception',
            $e->getMessage(),
            ['exception' => $e->getMessage()],
            []
        );

            throw new \Exception($e->getMessage());
        }
    }


}