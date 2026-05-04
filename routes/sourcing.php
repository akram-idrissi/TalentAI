<?php

use Inertia\Inertia;

Route::get('/sourcing', fn () => Inertia::render('ComingSoon', [
    'title' => 'Sourcing automatique',
    'description' => 'Le sourcing automatique sera disponible prochainement.',
]))->name('sourcing');
