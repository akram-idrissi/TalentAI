<?php

namespace App\Http\Controllers;

use App\Models\ParameterGroup;
use App\Models\ParameterValue;
use App\Services\ActivityLogger;
use App\Services\ParameterService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ParameterGroupController extends Controller
{
    public function __construct(private readonly ParameterService $params) {}

    /**
     * List all groups with their value counts.
     *
     * @return Response Inertia page — Parameters/Index — or Fallback on failure
     */
    public function index(): Response
    {
        $this->authorize('parameters.view');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $groups = ParameterGroup::withCount(['values', 'activeValues'])
                ->orderBy('label')
                ->get();

            $logger->log(
                'parameters.index',
                'Consultation de la liste des groupes de paramètres.',
                [],
                [ParameterGroup::class]
            );

            return Inertia::render('Parameters/Index', [
                'groups' => $groups,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.index.error',
                'Erreur lors de la récupération des groupes de paramètres : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger la liste des paramètres.',
            ]);
        }
    }

    /**
     * Show the form for creating a new parameter group.
     *
     * @return Response Inertia page — Parameters/CreateGroup — or Fallback on failure
     */
    public function create(): Response
    {
        $this->authorize('parameters.create');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'parameters.create',
                'Affichage du formulaire de création d\'un groupe de paramètres.',
                [],
                [ParameterGroup::class]
            );

            return Inertia::render('Parameters/CreateGroup');
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.create.error',
                'Erreur lors de l\'affichage du formulaire de création : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher le formulaire de création.',
            ]);
        }
    }

    /**
     * Validate and persist a newly created parameter group.
     *
     * @param  Request  $request  Must contain: key, label, description (nullable), is_active
     * @return RedirectResponse Redirects to parameters.index on success, or back with error on failure
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('parameters.create');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $data = $request->validate([
                'key' => ['required', 'string', 'max:100', 'unique:parameter_groups,key', 'regex:/^[a-z0-9_]+$/'],
                'label' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:500'],
                'is_active' => ['boolean'],
            ]);

            $group = ParameterGroup::create($data);

            $logger->log(
                'parameters.store',
                "Création du groupe de paramètres « {$group->label} » (clé : {$group->key}).",
                ['group_id' => $group->id, 'key' => $group->key, 'label' => $group->label],
                [ParameterGroup::class]
            );

            return redirect()->route('dashboard.parameters.index')
                ->with('success', 'Groupe créé avec succès.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.store.error',
                'Erreur lors de la création du groupe de paramètres : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return redirect()->back()->with('error', 'Impossible de créer le groupe.');
        }
    }

    /**
     * Show a group and all its values — the main management screen.
     *
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @return Response Inertia page — Parameters/Show — or Fallback on failure
     */
    public function show(ParameterGroup $group): Response
    {
        $this->authorize('parameters.view');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $group->load('values');

            $logger->log(
                'parameters.show',
                "Consultation du groupe de paramètres « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'key' => $group->key],
                [ParameterGroup::class]
            );

            return Inertia::render('Parameters/Show', [
                'group' => $group,
                'values' => $group->values,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.show.error',
                "Erreur lors de la consultation du groupe (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher ce groupe de paramètres.',
            ]);
        }
    }

    /**
     * Show the form for editing an existing parameter group.
     *
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance to edit
     * @return Response Inertia page — Parameters/EditGroup — or Fallback on failure
     */
    public function edit(ParameterGroup $group): Response
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'parameters.edit',
                "Affichage du formulaire d'édition du groupe « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'key' => $group->key],
                [ParameterGroup::class]
            );

            return Inertia::render('Parameters/EditGroup', [
                'group' => $group,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.edit.error',
                "Erreur lors de l'affichage du formulaire d'édition (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher le formulaire d\'édition.',
            ]);
        }
    }

    /**
     * Validate and apply updates to the specified parameter group.
     * Invalidates cache for both old and new keys if the key changed.
     *
     * @param  Request  $request  Must contain: key, label, description (nullable), is_active
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance to update
     * @return RedirectResponse Redirects to parameters.show on success, or back with error on failure
     */
    public function update(Request $request, ParameterGroup $group): RedirectResponse
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $data = $request->validate([
                'key' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/', Rule::unique('parameter_groups', 'key')->ignore($group->id)],
                'label' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:500'],
                'is_active' => ['boolean'],
            ]);

            $oldKey = $group->key;

            $modifications = collect($data)
                ->filter(fn ($newValue, $key) => $group->getAttribute($key) != $newValue)
                ->map(fn ($newValue, $key) => [
                    'avant' => $group->getAttribute($key),
                    'après' => $newValue,
                ])
                ->toArray();

            $group->update($data);

            $this->params->invalidate([$oldKey, $data['key']]);

            $logger->log(
                'parameters.update',
                "Mise à jour du groupe « {$group->label} » (ID : {$group->id}).".
                (count($modifications) ? ' Champs modifiés : '.implode(', ', array_keys($modifications)).'.' : ' Aucune modification détectée.'),
                ['group_id' => $group->id, 'modifications' => $modifications],
                [ParameterGroup::class]
            );

            return redirect()->route('dashboard.parameters.show', $group)
                ->with('success', 'Groupe mis à jour.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.update.error',
                "Erreur lors de la mise à jour du groupe (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return redirect()->back()->with('error', 'Impossible de mettre à jour le groupe.');
        }
    }

    /**
     * Remove the specified parameter group. System groups are protected.
     *
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance to delete
     * @return RedirectResponse Redirects to parameters.index on success, or back with error on failure
     */
    public function destroy(ParameterGroup $group): RedirectResponse
    {
        $this->authorize('parameters.delete');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            if ($group->is_system) {
                return back()->with('error', 'Ce groupe système ne peut pas être supprimé.');
            }

            $groupId = $group->id;
            $groupLabel = $group->label;
            $groupKey = $group->key;

            $this->params->invalidate($groupKey);
            $group->delete();

            $logger->log(
                'parameters.destroy',
                "Suppression du groupe de paramètres « {$groupLabel} » (ID : {$groupId}, clé : {$groupKey}).",
                ['group_id' => $groupId, 'key' => $groupKey, 'label' => $groupLabel],
                [ParameterGroup::class]
            );

            return redirect()->route('dashboard.parameters.index')
                ->with('success', 'Groupe supprimé.');
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.destroy.error',
                "Erreur lors de la suppression du groupe (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class]
            );

            return redirect()->back()->with('error', 'Impossible de supprimer le groupe.');
        }
    }

    /**
     * Validate and persist a new value under the specified group.
     * Order is auto-assigned (appended at end) if not provided.
     *
     * @param  Request  $request  Must contain: value, label, order (optional), is_active, metadata (nullable array)
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @return RedirectResponse Back with success flash, or back with error on failure
     */
    public function storeValue(Request $request, ParameterGroup $group): RedirectResponse
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $data = $request->validate([
                'value' => ['required', 'string', 'max:100', Rule::unique('parameter_values', 'value')->where('group_id', $group->id)],
                'label' => ['required', 'string', 'max:255'],
                'order' => ['integer', 'min:0'],
                'is_active' => ['boolean'],
                'metadata' => ['nullable', 'array'],
            ]);

            if (! isset($data['order'])) {
                $data['order'] = $group->values()->max('order') + 1;
            }

            $value = $group->values()->create($data);
            $this->params->invalidate($group->key);

            $logger->log(
                'parameters.value.store',
                "Ajout de la valeur « {$value->label} » (valeur : {$value->value}) au groupe « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'value_id' => $value->id, 'value' => $value->value],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('success', 'Valeur ajoutée.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.value.store.error',
                "Erreur lors de l'ajout d'une valeur au groupe (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('error', 'Impossible d\'ajouter la valeur.');
        }
    }

    /**
     * Validate and apply updates to the specified parameter value.
     *
     * @param  Request  $request  Must contain: value, label, order, is_active, metadata (nullable array)
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @param  ParameterValue  $value  Route-model-bound ParameterValue instance to update
     * @return RedirectResponse Back with success flash, or back with error on failure
     */
    public function updateValue(Request $request, ParameterGroup $group, ParameterValue $value): RedirectResponse
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorizeValue($group, $value);

            $data = $request->validate([
                'value' => ['required', 'string', 'max:100', Rule::unique('parameter_values', 'value')->where('group_id', $group->id)->ignore($value->id)],
                'label' => ['required', 'string', 'max:255'],
                'order' => ['integer', 'min:0'],
                'is_active' => ['boolean'],
                'metadata' => ['nullable', 'array'],
            ]);

            $modifications = collect($data)
                ->filter(fn ($newValue, $key) => $value->getAttribute($key) != $newValue)
                ->map(fn ($newValue, $key) => [
                    'avant' => $value->getAttribute($key),
                    'après' => $newValue,
                ])
                ->toArray();

            $value->update($data);
            $this->params->invalidate($group->key);

            $logger->log(
                'parameters.value.update',
                "Mise à jour de la valeur « {$value->label} » (ID : {$value->id}) dans le groupe « {$group->label} ».".
                (count($modifications) ? ' Champs modifiés : '.implode(', ', array_keys($modifications)).'.' : ''),
                ['group_id' => $group->id, 'value_id' => $value->id, 'modifications' => $modifications],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('success', 'Valeur mise à jour.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.value.update.error',
                "Erreur lors de la mise à jour de la valeur (ID : {$value->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'value_id' => $value->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('error', 'Impossible de mettre à jour la valeur.');
        }
    }

    /**
     * Remove the specified parameter value from the group.
     *
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @param  ParameterValue  $value  Route-model-bound ParameterValue instance to delete
     * @return RedirectResponse Back with success flash, or back with error on failure
     */
    public function destroyValue(ParameterGroup $group, ParameterValue $value): RedirectResponse
    {
        $this->authorize('parameters.delete');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorizeValue($group, $value);

            $valueId = $value->id;
            $valueLabel = $value->label;

            $value->delete();
            $this->params->invalidate($group->key);

            $logger->log(
                'parameters.value.destroy',
                "Suppression de la valeur « {$valueLabel} » (ID : {$valueId}) du groupe « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'value_id' => $valueId],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('success', 'Valeur supprimée.');
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.value.destroy.error',
                "Erreur lors de la suppression de la valeur (ID : {$value->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'value_id' => $value->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('error', 'Impossible de supprimer la valeur.');
        }
    }

    /**
     * Update the display order of values via drag-and-drop.
     * Expects: { order: [{ id: 1, order: 0 }, { id: 2, order: 1 }, ...] }
     *
     * @param  Request  $request  Must contain: order (array of {id, order} objects)
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @return RedirectResponse Back with success flash, or back with error on failure
     */
    public function reorderValues(Request $request, ParameterGroup $group): RedirectResponse
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'order' => ['required', 'array'],
                'order.*.id' => ['required', 'integer', 'exists:parameter_values,id'],
                'order.*.order' => ['required', 'integer', 'min:0'],
            ]);

            foreach ($request->order as $item) {
                ParameterValue::where('id', $item['id'])
                    ->where('group_id', $group->id)
                    ->update(['order' => $item['order']]);
            }

            $this->params->invalidate($group->key);

            $logger->log(
                'parameters.value.reorder',
                "Réorganisation des valeurs du groupe « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'order' => $request->order],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('success', 'Ordre mis à jour.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.value.reorder.error',
                "Erreur lors de la réorganisation des valeurs du groupe (ID : {$group->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('error', 'Impossible de réorganiser les valeurs.');
        }
    }

    /**
     * Toggle the active state of a parameter value without opening the edit form.
     *
     * @param  ParameterGroup  $group  Route-model-bound ParameterGroup instance
     * @param  ParameterValue  $value  Route-model-bound ParameterValue instance to toggle
     * @return RedirectResponse Back with success flash, or back with error on failure
     */
    public function toggleValue(ParameterGroup $group, ParameterValue $value): RedirectResponse
    {
        $this->authorize('parameters.edit');
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorizeValue($group, $value);

            $value->update(['is_active' => ! $value->is_active]);
            $this->params->invalidate($group->key);

            $state = $value->is_active ? 'activée' : 'désactivée';

            $logger->log(
                'parameters.value.toggle',
                "Valeur « {$value->label} » (ID : {$value->id}) {$state} dans le groupe « {$group->label} » (ID : {$group->id}).",
                ['group_id' => $group->id, 'value_id' => $value->id, 'is_active' => $value->is_active],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('success', "Valeur {$state}.");
        } catch (\Throwable $e) {
            $logger->log(
                'parameters.value.toggle.error',
                "Erreur lors du changement d'état de la valeur (ID : {$value->id}) : ".$e->getMessage(),
                ['group_id' => $group->id, 'value_id' => $value->id, 'exception' => $e->getMessage()],
                [ParameterGroup::class, ParameterValue::class]
            );

            return back()->with('error', 'Impossible de modifier l\'état de la valeur.');
        }
    }

    /**
     * Ensure the value belongs to the given group.
     * Prevents /groups/1/values/99 where value 99 belongs to group 2.
     */
    private function authorizeValue(ParameterGroup $group, ParameterValue $value): void
    {
        abort_if($value->group_id !== $group->id, 403, 'Cette valeur n\'appartient pas à ce groupe.');
    }
}
