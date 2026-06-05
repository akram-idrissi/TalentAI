<?php

namespace App\Http\Controllers\Brief;

use App\Enums\BriefStatus;
use App\Http\Controllers\Controller;
use App\Models\Brief;
use App\Services\ActivityLogger;
use App\Services\BriefService;
use App\Services\ParameterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BriefController extends Controller
{
    public function __construct(
        private readonly ActivityLogger $logger,
        private readonly BriefService $briefService,
        private readonly ParameterService $params,
    ) {}

    /**
     * Validation rules shared by store() and update().
     *
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'sector' => ['required', Rule::in($this->params->getGroup('sectors')->pluck('value'))],
            'contract_type' => ['required', Rule::in($this->params->getGroup('contract_types')->pluck('value'))],
            'location' => 'required|string|max:255',
            'salary_range' => 'nullable|string|max:255',
            'min_experience_years' => ['required', Rule::in($this->params->getGroup('experience_options')->pluck('value'))],
            'education_level' => ['required', Rule::in($this->params->getGroup('education_levels')->pluck('value'))],
            'languages' => 'nullable|string',
            'seniority_level' => ['nullable', Rule::in($this->params->getGroup('seniority_levels')->pluck('value'))],
            'target_companies' => 'nullable|string',
            'gender_pref' => ['nullable', Rule::in($this->params->getGroup('gender_prefs')->pluck('value'))],
            'age_range' => ['nullable', Rule::in($this->params->getGroup('age_ranges')->pluck('value'))],
            'mission_description' => 'required|string',
            'required_skills' => 'required|string',
            'soft_skills' => 'nullable|string',
            'scoring_weights' => 'nullable|array',
            'scoring_weights.experience' => 'required_with:scoring_weights|integer|min:0|max:100',
            'scoring_weights.education' => 'required_with:scoring_weights|integer|min:0|max:100',
            'scoring_weights.sector' => 'required_with:scoring_weights|integer|min:0|max:100',
            'scoring_weights.soft_skills' => 'required_with:scoring_weights|integer|min:0|max:100',
            'scoring_weights.location' => 'required_with:scoring_weights|integer|min:0|max:100',
            'status' => ['required', Rule::enum(BriefStatus::class)],
        ];
    }

    /**
     * Parameter groups needed by every create / edit / show form.
     */
    private function formParams(): array
    {
        return $this->params->getAll([
            'sectors',
            'education_levels',
            'experience_options',
            'age_ranges',
            'languages',
            'seniority_levels',
            'contract_types',
            'gender_prefs',
        ]);
    }

    /**
     * Normalise the raw `filters` request input into a clean array.
     */
    private function parseFilters(Request $request): array
    {
        $filters = $request->input('filters');

        if (is_string($filters)) {
            $filters = json_decode($filters, true);
        }

        return is_array($filters) ? $filters : [];
    }

    /**
     * Allowed sortable columns and their DB column names.
     */
    private const SORTABLE_COLUMNS = [
        'title' => 'title',
        'sector' => 'sector',
        'contract_type' => 'contract_type',
        'min_experience_years' => 'min_experience_years',
        'location' => 'location',
        'status' => 'status',
        'created_at' => 'created_at',
    ];

    /**
     * Display a paginated list of briefs, optionally filtered and sorted.
     *
     * @param  Request  $request  Supports `filters` (JSON), `sort_by`, `sort_dir`, `page`
     */
    public function index(Request $request): Response
    {
        $this->authorize('briefs.view');
        try {
            $filters = $this->parseFilters($request);

            // Resolve sort params — whitelist column names to prevent SQL injection
            $sortBy = array_key_exists($request->input('sort_by', ''), self::SORTABLE_COLUMNS)
                ? self::SORTABLE_COLUMNS[$request->input('sort_by')]
                : 'created_at';
            $sortDir = in_array(strtolower($request->input('sort_dir', 'desc')), ['asc', 'desc'])
                ? strtolower($request->input('sort_dir', 'desc'))
                : 'desc';

            $briefs = $this->briefService->getPaginatedBriefs($filters, $sortBy, $sortDir);

            $this->logger->log(
                'brief.index',
                'Consultation de la liste des briefs.',
                ['filters' => $filters, 'sort_by' => $sortBy, 'sort_dir' => $sortDir],
                [Brief::class]
            );

            return Inertia::render('Briefs/Index', [
                'briefs' => $briefs,
                'filters' => $filters,
                'sort_by' => $request->input('sort_by', 'created_at'),
                'sort_dir' => $sortDir,
                'params' => $this->params->getAll([
                    'sectors',
                    'education_levels',
                    'experience_options',
                    'contract_types',
                    'gender_prefs',
                    'age_ranges',
                    'languages',
                    'seniority_levels',
                ]),
                'brief_statuses' => BriefStatus::toSelectArray(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->log(
                'brief.index.error',
                'Erreur lors de la récupération des briefs : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Brief::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger la liste des briefs.',
            ]);
        }
    }

    /**
     * Show the form for creating a new brief.
     */
    public function create(): Response
    {
        $this->authorize('briefs.create');
        try {
            $this->logger->log('brief.create', "Affichage du formulaire de création d'un brief.", [], [Brief::class]);

            return Inertia::render('Briefs/Create', [
                'params' => $this->formParams(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->log('brief.create.error', 'Erreur lors de l\'affichage du formulaire de création : '.$e->getMessage(), ['exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible d\'afficher le formulaire de création.']);
        }
    }

    /**
     * Validate and persist a newly created brief.
     */
    public function store(Request $request): RedirectResponse|Response
    {
        $this->authorize('briefs.create');
        try {
            $validated = $request->validate($this->rules());
            $brief = $this->briefService->createBrief($validated, auth()->id());

            try {
                $this->logger->log('brief.store', "Création du brief « {$brief->title} » (ID : {$brief->id}).", [$request->all()], [Brief::class]);
            } catch (\Throwable) {
            }

            return redirect()->route('dashboard.briefs.index')->with('success', 'Brief créé avec succès.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $this->logger->log('brief.store.error', 'Erreur lors de la création du brief : '.$e->getMessage(), ['exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de créer le brief.']);
        }
    }

    /**
     * Display the specified brief.
     */
    public function show(Brief $brief): Response
    {
        $this->authorize('briefs.view');
        try {
            $brief->load('creator');

            $this->logger->log('brief.show', "Consultation du brief « {$brief->title} » (ID : {$brief->id}).", ['brief_id' => $brief->id], [Brief::class]);

            return Inertia::render('Briefs/Show', [
                'brief' => array_merge($brief->toArray(), ['created_by' => $brief->creator?->name]),
                'params' => $this->formParams(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->log('brief.show.error', "Erreur lors de la consultation du brief (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible d\'afficher ce brief.']);
        }
    }

    /**
     * Show the form for editing the specified brief.
     */
    public function edit(Brief $brief): Response
    {
        $this->authorize('briefs.edit');
        try {
            $this->logger->log('brief.edit', "Affichage du formulaire d'édition du brief « {$brief->title} » (ID : {$brief->id}).", ['brief_id' => $brief->id], [Brief::class]);

            return Inertia::render('Briefs/Edit', [
                'brief' => $brief,
                'params' => $this->formParams(),
            ]);
        } catch (\Throwable $e) {
            $this->logger->log('brief.edit.error', "Erreur lors de l'affichage du formulaire d'édition (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible d\'afficher le formulaire d\'édition.']);
        }
    }

    /**
     * Validate and apply updates to the specified brief.
     */
    public function update(Request $request, Brief $brief): RedirectResponse|Response
    {
        $this->authorize('briefs.edit');
        try {
            $validated = $request->validate($this->rules());
            $statutAvant = $brief->status;

            ['brief' => $brief, 'modifications' => $modifications]
                = $this->briefService->updateBrief($brief, $validated);

            try {
                $changedFields = implode(', ', array_keys($modifications));
                $detailSuffix = count($modifications) ? " Champs modifiés : {$changedFields}." : ' Aucune modification détectée.';
                $statusSuffix = $statutAvant !== $brief->status ? " Changement de statut : « {$statutAvant} » → « {$brief->status} »." : '';

                $this->logger->log('brief.update', "Mise à jour du brief « {$brief->title} » (ID : {$brief->id}).{$detailSuffix}{$statusSuffix}", ['brief_id' => $brief->id, 'modifications' => $modifications], [Brief::class]);
            } catch (\Throwable) {
            }

            return redirect()->route('dashboard.briefs.index')->with('success', 'Brief mis à jour avec succès.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $this->logger->log('brief.update.error', "Erreur lors de la mise à jour du brief (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de mettre à jour ce brief.', 'brief' => $brief]);
        }
    }

    /**
     * Remove the specified brief from storage.
     */
    public function destroy(Brief $brief): RedirectResponse|Response
    {
        $this->authorize('briefs.delete');
        try {
            $briefId = $brief->id;
            $briefTitle = $brief->title;
            $brief->delete();

            $this->logger->log('brief.destroy', "Suppression du brief « {$briefTitle} » (ID : {$briefId}).", ['brief_id' => $briefId, 'title' => $briefTitle], [Brief::class]);

            return redirect()->route('dashboard.briefs.index')->with('success', 'Brief supprimé avec succès.');
        } catch (\Throwable $e) {
            $this->logger->log('brief.destroy.error', "Erreur lors de la suppression du brief (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de supprimer ce brief.']);
        }
    }

    /**
     * Activate the brief.
     */
    public function activate(Brief $brief): RedirectResponse|Response
    {
        $this->authorize('briefs.edit');
        try {
            $this->briefService->activateBrief($brief);

            $this->logger->log('brief.activate', "Activation du brief « {$brief->title} » (ID : {$brief->id}).", ['brief_id' => $brief->id], [Brief::class]);

            return redirect()->route('dashboard.briefs.show', $brief->id)->with('success', 'Brief activé.');
        } catch (\Throwable $e) {
            $this->logger->log('brief.activate.error', "Erreur lors de l'activation du brief (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => "Impossible d'activer ce brief."]);
        }
    }

    /**
     * Update only the status of the specified brief (inline status change).
     *
     * PATCH  /briefs/{brief}/status
     */
    public function updateStatus(Request $request, Brief $brief): JsonResponse
    {
        $this->authorize('briefs.edit');
        \Log::debug('Status update payload', [
            'status' => $request->input('status'),
            'all' => $request->all(),
        ]);
        try {
            $validated = $request->validate([
                'status' => ['required', Rule::enum(BriefStatus::class)],
            ]);
        } catch (ValidationException $e) {
            \Log::error('Status validation failed', [
                'input' => $request->all(),
                'errors' => $e->errors(),
                'allowed' => array_map(fn ($case) => $case->value, BriefStatus::cases()),
            ]);

            throw $e;
        }

        $previousStatus = $brief->status;
        $brief->status = $validated['status'];
        $brief->save();

        try {
            $this->logger->log(
                'brief.status_update',
                "Changement de statut du brief « {$brief->title} » (ID : {$brief->id}) : « {$previousStatus} » → « {$brief->status} ».",
                ['brief_id' => $brief->id, 'from' => $previousStatus, 'to' => $brief->status],
                [Brief::class]
            );
        } catch (\Throwable) {

        }

        return response()->json([
            'success' => true,
            'brief' => ['id' => $brief->id, 'status' => $brief->status],
            'message' => "Statut mis à jour : « {$brief->status} ».",
        ]);
    }

    /**
     * Bulk-update the status of multiple briefs at once.
     *
     * PATCH  /briefs/bulk-status
     * Route name: dashboard.briefs.bulk-update-status
     *
     * Body: { ids: number[], status: BriefStatus }
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $this->authorize('briefs.edit');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:briefs,id',
            'status' => ['required', Rule::enum(BriefStatus::class)],
        ]);

        $briefs = Brief::whereIn('id', $validated['ids'])->get();
        $count = 0;

        foreach ($briefs as $brief) {
            $previousStatus = $brief->status;
            $brief->status = $validated['status'];
            $brief->save();
            $count++;

            try {
                $this->logger->log(
                    'brief.bulk_status_update',
                    "Changement de statut (bulk) du brief « {$brief->title} » (ID : {$brief->id}) : « {$previousStatus} » → « {$brief->status} ».",
                    ['brief_id' => $brief->id, 'from' => $previousStatus, 'to' => $brief->status],
                    [Brief::class]
                );
            } catch (\Throwable) {
            }
        }

        return response()->json([
            'success' => true,
            'updated' => $count,
            'status' => $validated['status'],
            'message' => "{$count} brief(s) mis à jour.",
        ]);
    }

    /**
     * Bulk-delete multiple briefs at once.
     *
     * DELETE  /briefs/bulk
     * Route name: dashboard.briefs.bulk-destroy
     *
     * Body: { ids: number[] }
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $this->authorize('briefs.delete');

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:briefs,id',
        ]);

        $briefs = Brief::whereIn('id', $validated['ids'])->get();
        $count = 0;

        foreach ($briefs as $brief) {
            $briefId = $brief->id;
            $briefTitle = $brief->title;
            $brief->delete();
            $count++;

            try {
                $this->logger->log(
                    'brief.bulk_destroy',
                    "Suppression (bulk) du brief « {$briefTitle} » (ID : {$briefId}).",
                    ['brief_id' => $briefId, 'title' => $briefTitle],
                    [Brief::class]
                );
            } catch (\Throwable) {
            }
        }

        return response()->json([
            'success' => true,
            'deleted' => $count,
            'message' => "{$count} brief(s) supprimé(s).",
        ]);
    }

    /**
     * Duplicate the specified brief as a new draft.
     *
     * POST  /briefs/{brief}/duplicate
     */
    public function duplicate(Brief $brief): RedirectResponse|Response
    {
        $this->authorize('briefs.create');

        try {
            $newBrief = $brief->replicate();
            $newBrief->title = $brief->title.' (copie)';
            $newBrief->status = BriefStatus::Draft;
            $newBrief->created_by = auth()->id();
            $newBrief->save();

            try {
                $this->logger->log(
                    'brief.duplicate',
                    "Duplication du brief « {$brief->title} » (ID : {$brief->id}) → nouveau brief « {$newBrief->title} » (ID : {$newBrief->id}).",
                    ['source_id' => $brief->id, 'new_id' => $newBrief->id],
                    [Brief::class]
                );
            } catch (\Throwable) {
            }

            return redirect()->route('dashboard.briefs.edit', $newBrief->id)
                ->with('success', 'Brief dupliqué. Vous pouvez maintenant le modifier.');
        } catch (\Throwable $e) {
            $this->logger->log('brief.duplicate.error', "Erreur lors de la duplication du brief (ID : {$brief->id}) : ".$e->getMessage(), ['brief_id' => $brief->id, 'exception' => $e->getMessage()], [Brief::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de dupliquer ce brief.']);
        }
    }
}
