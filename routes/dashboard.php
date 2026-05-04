<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        require __DIR__.'/briefs.php';
        require __DIR__.'/sourcing.php';
        require __DIR__.'/candidates.php';
        require __DIR__.'/interviews.php';
        require __DIR__.'/reports.php';
        require __DIR__.'/integrations.php';
    });
});
