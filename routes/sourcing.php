<?php

use App\Http\Controllers\Sourcing\SourcingController;

Route::get('sourcing/stream', [SourcingController::class, 'stream'])->name('sourcing.stream');
Route::resource('sourcing', SourcingController::class);
