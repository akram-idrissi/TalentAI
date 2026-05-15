<?php

use App\Http\Controllers\TranscriptionController;
use Illuminate\Support\Facades\Route;

Route::get('/transcribe', [TranscriptionController::class, 'index']);
Route::post('/transcribe', [TranscriptionController::class, 'transcribe']);
Route::get('/transcriptions/{transcription}', [TranscriptionController::class, 'show']);
