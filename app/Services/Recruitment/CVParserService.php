<?php

namespace App\Services\Recruitment;

use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;

class CVParserService
{
    public function extractText(string $path): string
    {
        try {

            Log::info('PDF PARSER START', [
                'path' => $path
            ]);

            if (!file_exists($path)) {

                Log::error('PDF FILE NOT FOUND');

                throw new \Exception('PDF file not found');;
            }

            $parser = new Parser();

            $pdf = $parser->parseFile($path);

            $text = $pdf->getText();

            Log::info('PDF TEXT EXTRACTED', [
                'length' => strlen($text),
                'preview' => substr($text, 0, 500)
            ]);

            return trim($text);

        } catch (\Throwable $e) {

            Log::error('PDF PARSE ERROR', [
                'message' => $e->getMessage()
            ]);

            throw new \Exception(
                'PDF parse error: ' . $e->getMessage()
            );
        }
    }
}