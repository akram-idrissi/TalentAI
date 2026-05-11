<?php

namespace App\Http\Controllers;

use App\Models\Brief;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InterviewController extends Controller
{
    /**
     * Affiche le formulaire d'upload pour le Module 4.
     * On envoie la liste des Briefs pour que l'utilisateur puisse choisir le poste.
     */
    public function create()
    {
        return Inertia::render('Interviews/Create', [
            'briefs' => Brief::all(['id', 'title']),
        ]);
    }

    /**
     * Gère l'upload de la vidéo et les premières étapes du Module 4.
     */
    public function store(Request $request)
    {
        // 1. Validation rigoureuse selon le Cahier des Charges (500 MB max)
        $request->validate([
            'brief_id' => 'required|exists:briefs,id',
            'candidate_name' => 'required|string|max:255',
            'video' => 'required|file|mimes:mp4,m4a,wav,mp3|max:512000',
        ]);

        // 2. Stockage du fichier dans storage/app/public/interviews
        if ($request->hasFile('video')) {
            $path = $request->file('video')->store('interviews', 'public');

            /* NOTE POUR PLUS TARD :
               C'est ici qu'on déclenchera les Jobs pour :
               - Whisper API (Transcription)
               - Claude API (Analyse des réponses)
            */

            return redirect()->back()->with('success', 'Fichier reçu. L\'analyse IA va démarrer.');
        }

        return redirect()->back()->with('error', 'Erreur lors de l\'upload du fichier.');
    }
}
