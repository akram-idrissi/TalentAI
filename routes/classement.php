<?php

use Inertia\Inertia;


Route::get('/classement', function () {
    return Inertia::render('Classement/Index');
})->name('classement');