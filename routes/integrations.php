<?php

use Inertia\Inertia;

Route::get('/integrations', fn () => Inertia::render('ComingSoon', [
    'title' => 'Intégrations',
    'description' => 'Les intégrations seront disponibles prochainement.',
]))->name('integrations');
