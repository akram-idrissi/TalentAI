<?php

use App\Models\Brief;
use Inertia\Inertia;

Route::get('/classement', function () {
    $briefs = Brief::select('id', 'title')->orderByDesc('created_at')->get();

    $selectedBriefId = request('brief_id') ?? $briefs->first()?->id;

    $candidates = [];

    if ($selectedBriefId) {
        $brief = Brief::with(['candidates' => function ($q) {
            $q->orderByDesc('brief_candidat.score');
        }])->find($selectedBriefId);

        if ($brief) {
            $candidates = $brief->candidates->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->full_name,
                    'role' => $c->current_title,
                    'company' => $c->current_company,
                    'location' => $c->location,
                    'experience_years' => $c->experience_years,
                    'linkedin_url' => $c->linkedin_url,
                    'skills' => $c->skills ?? [],
                    'summary' => $c->summary,
                    'score' => round($c->pivot->score ?? 0),
                    'score_breakdown' => $c->pivot->score_breakdown
                        ? (is_string($c->pivot->score_breakdown)
                            ? json_decode($c->pivot->score_breakdown, true)
                            : $c->pivot->score_breakdown)
                        : null,
                ];
            })->values()->toArray();
        }
    }

    return Inertia::render('Classement/Index', [
        'briefs' => $briefs,
        'selectedBriefId' => (int) $selectedBriefId,
        'candidates' => $candidates,
    ]);
})->name('classement');
