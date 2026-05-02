<?php

use Inertia\Inertia;

Route::get('/interviews', fn () => Inertia::render('ComingSoon', [
    'title' => 'Entretiens',
    'description' => 'La gestion des entretiens sera disponible prochainement.',
]))->name('interviews');
