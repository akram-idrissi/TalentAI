<?php

use App\Http\Controllers\Integration\ApiTokenController;

Route::get('/integrations', [ApiTokenController::class, 'index'])->name('integrations.index');
Route::post('/integrations', [ApiTokenController::class, 'store'])->name('integrations.store');
Route::delete('/integrations/{provider}', [ApiTokenController::class, 'destroy'])->name('integrations.destroy');
Route::post('/integrations/test', [ApiTokenController::class, 'test'])->name('integrations.test');
