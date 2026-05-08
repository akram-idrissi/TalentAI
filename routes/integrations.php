<?php

use Inertia\Inertia;


Route::get('/integrations', function () {
    return Inertia::render('Integrations/Index');
})->name('integrations');