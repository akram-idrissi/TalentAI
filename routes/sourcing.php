<?php

use Inertia\Inertia;

Route::get('/sourcing', function () {
    return Inertia::render('Sourcing/Index');
})->name('sourcing');
