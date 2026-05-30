<?php

use App\Http\Controllers\Integration\ApiTokenController;

Route::get('/integrations', [ApiTokenController::class, 'index'])->name('integrations.index')->middleware('can:integrations.view');
Route::post('/integrations', [ApiTokenController::class, 'store'])->name('integrations.store')->middleware('can:integrations.manage');
Route::delete('/integrations/{provider}', [ApiTokenController::class, 'destroy'])->name('integrations.destroy')->middleware('can:integrations.manage');
Route::post('/integrations/test', [ApiTokenController::class, 'test'])->name('integrations.test')->middleware('can:integrations.manage');
