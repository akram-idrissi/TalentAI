<?php

use App\Http\Controllers\InterviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes pour le Module 4 - Intelligence Entretiens
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    // Afficher le formulaire d'upload d'un nouvel entretien
    Route::get('/interviews/create', [InterviewController::class, 'create'])->name('interviews.create');

    // Traiter l'upload du fichier vidéo et lancer l'analyse
    Route::post('/interviews', [InterviewController::class, 'store'])->name('interviews.store');

    // Liste de tous les entretiens (Historique)
    Route::get('/interviews', [InterviewController::class, 'index'])->name('interviews.index');

});
