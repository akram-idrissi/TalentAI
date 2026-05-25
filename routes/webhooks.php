<?php

use App\Http\Controllers\Interview\TranscriptionWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhook/assemblyai', [TranscriptionWebhookController::class, 'handle'])
    ->name('webhook.assemblyai');
