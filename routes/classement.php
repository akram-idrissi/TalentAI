<?php

use Inertia\Inertia;


Route::get('/classement', function () {
    return Inertia::render('CLASSEMENT/Index');
})->name('classement');