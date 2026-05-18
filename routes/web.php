<?php

use App\Http\Controllers\InterviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| 1. Public Routes
|--------------------------------------------------------------------------
| Routes accessible without authentication.
*/
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

/**
 * Locale Switcher (Multi-language support)
 */
Route::post('/locale', function (Request $request) {
    $locale = $request->input('locale');
    if (in_array($locale, ['en', 'fr', 'ar'])) {
        session(['locale' => $locale]);
    }

    return redirect()->back();
})->name('locale.switch');

/*
|--------------------------------------------------------------------------
| 2. Protected Routes (Authenticated Users Only)
|--------------------------------------------------------------------------
| These routes handle the TalentAI core logic.
*/
Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Module 4: Intelligence Entretiens (Functional Specs 3.1 - 3.4)
    |--------------------------------------------------------------------------
    */

    // 4.1 Interview Index: Main Dashboard for uploads [cite: 68, 71]
    Route::get('/dashboard/interviews', [InterviewController::class, 'index'])->name('interviews.index');

    // 4.2 Interview Storage & AI Analysis Trigger [cite: 70, 77]
    // Note: Matches the 'router.post' link from your React Index.tsx component
    Route::post('/dashboard/interviews', [InterviewController::class, 'store'])->name('interviews.store');

    // 4.3 AI Reports & Comparative Ranking [cite: 108, 109]
    // This displays the final evaluation and scores per candidate
    Route::get('/dashboard/reports', [InterviewController::class, 'reports'])->name('interviews.reports');

});

/*
|--------------------------------------------------------------------------
| 3. External Modular Routes
|--------------------------------------------------------------------------
| Including additional dashboard, settings, and authentication logic.
*/
require __DIR__.'/dashboard.php';
require __DIR__.'/roles.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
