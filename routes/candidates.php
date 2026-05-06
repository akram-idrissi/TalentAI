<?php

use Inertia\Inertia;

Route::get('/candidates', fn () => Inertia::render('ComingSoon', [
    'title' => 'Base candidats',
    'description' => 'La base de candidats sera disponible prochainement.',
]))->name('candidates');

Route::get('/candidates/rankings', fn () => Inertia::render('ComingSoon', [
    'title' => 'Classements IA',
    'description' => 'Les classements IA seront disponibles prochainement.',
]))->name('candidates.rankings');
