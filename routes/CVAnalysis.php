<?php

use App\Http\Controllers\CVAnalysis\CVAnalysisController;

Route::prefix('cv-analysis')->group(function () {

    Route::get('/', [CVAnalysisController::class, 'index'])
        ->name('cv-analysis.index')->middleware('can:cv-analysis.view');

    Route::post('/upload', [CVAnalysisController::class, 'upload'])
        ->name('cv-analysis.upload')->middleware('can:cv-analysis.upload');

    Route::get('/create', [CVAnalysisController::class, 'create'])
        ->name('cv-analysis.create')->middleware('can:cv-analysis.create');

});
