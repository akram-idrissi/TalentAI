<?php

use App\Http\Controllers\Brief\BriefController;

Route::resource('briefs', BriefController::class);
Route::post('/briefs/{brief}/activate', [BriefController::class, 'activate'])->name('briefs.activate');
