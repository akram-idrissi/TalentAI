<?php

use App\Http\Controllers\Brief\BriefController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::resource('briefs', BriefController::class);
    Route::post('/locale', function (Request $request) {
        $locale = $request->input('locale');
        if (in_array($locale, ['en', 'fr'])) {
            session(['locale' => $locale]);
        }

        return redirect()->back();
    })->name('locale.switch');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
