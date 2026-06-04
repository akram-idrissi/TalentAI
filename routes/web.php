<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landingPage/LandingPage');
})->name('home');

Route::post('/locale', function (Request $request) {
    $locale = $request->input('locale');
    if (in_array($locale, ['en', 'fr', 'ar'])) {
        session(['locale' => $locale]);
    }

    return redirect()->back();
})->name('locale.switch');

require __DIR__.'/webhooks.php';
require __DIR__.'/dashboard.php';
require __DIR__.'/roles.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
