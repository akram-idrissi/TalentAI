<?php

use App\Http\Controllers\Sourcing\SourcingController;

// SSE stream (must be before the resource to avoid route shadowing)
Route::get('sourcing/stream', [SourcingController::class, 'stream'])->name('sourcing.stream');
Route::get('sourcing/run-status', [SourcingController::class, 'runStatus'])->name('sourcing.run-status');

Route::post('sourcing/launch', [SourcingController::class, 'launch'])->name('sourcing.launch');
Route::post('sourcing/generate-query', [SourcingController::class, 'generateQuery'])->name('sourcing.generate-query');
Route::post('sourcing/rescore', [SourcingController::class, 'rescore'])->name('sourcing.rescore');
Route::post('sourcing/generate-analysis', [SourcingController::class, 'generateAnalysis'])->name('sourcing.generate-analysis');
Route::get('sourcing/query-history', [SourcingController::class, 'queryHistory'])->name('sourcing.query-history');

// Resource (provides index, show, etc.)
Route::resource('sourcing', SourcingController::class)->only(['index']);
