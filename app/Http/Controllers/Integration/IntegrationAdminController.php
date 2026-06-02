<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationAdminController extends Controller
{
    /**
     * Display the integrations administration page.
     */
    public function index(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('integrations.manage');

            $integrations = Integration::orderBy('category')
                ->orderBy('label')
                ->get();

            $logger->log(
                'integration.admin.index',
                'Consultation de la liste des intégrations administrables.',
                ['count' => $integrations->count()],
                [Integration::class]
            );

            return Inertia::render('Integration/Admin/Index', [
                'integrations' => $integrations,
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'integration.admin.index.error',
                'Erreur lors du chargement des intégrations : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Integration::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger les intégrations.',
            ]);
        }
    }

    /**
     * Store a newly created integration.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('integrations.manage');

            $data = $request->validate([
                'provider' => ['required', 'string', 'max:100', 'unique:integrations,provider', 'regex:/^[a-z0-9_]+$/'],
                'label' => ['required', 'string', 'max:255'],
                'category' => ['required', 'string', 'max:100'],
                'icon' => ['required', 'string', 'max:10'],
                'description' => ['nullable', 'string', 'max:500'],
                'token_label' => ['required', 'string', 'max:255'],
                'placeholder' => ['nullable', 'string', 'max:255'],
                'env_key' => ['nullable', 'string', 'max:255'],
                'test_url' => ['nullable', 'url'],
                'docs_url' => ['nullable', 'url'],
                'oauth' => ['boolean'],
                'is_active' => ['boolean'],
            ]);

            $integration = Integration::create($data);

            $logger->log(
                'integration.admin.store',
                "Création de l'intégration « {$integration->label} ».",
                [
                    'id' => $integration->id,
                    'provider' => $integration->provider,
                ],
                [Integration::class]
            );

            return back()->with('success', 'Intégration créée.');
        } catch (\Throwable $e) {
            $logger->log(
                'integration.admin.store.error',
                "Erreur lors de la création d'une intégration : ".$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Integration::class]
            );

            return back()->with('error', 'Impossible de créer l’intégration.');
        }
    }

    /**
     * Update the specified integration.
     */
    public function update(Request $request, Integration $integration): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('integrations.manage');

            $data = $request->validate([
                'provider' => ['required', 'string', 'max:100', Rule::unique('integrations', 'provider')->ignore($integration->id), 'regex:/^[a-z0-9_]+$/'],
                'label' => ['required', 'string', 'max:255'],
                'category' => ['required', 'string', 'max:100'],
                'icon' => ['required', 'string', 'max:10'],
                'description' => ['nullable', 'string', 'max:500'],
                'token_label' => ['required', 'string', 'max:255'],
                'placeholder' => ['nullable', 'string', 'max:255'],
                'env_key' => ['nullable', 'string', 'max:255'],
                'test_url' => ['nullable', 'url'],
                'docs_url' => ['nullable', 'url'],
                'oauth' => ['boolean'],
                'is_active' => ['boolean'],
            ]);

            $integration->update($data);

            $logger->log(
                'integration.admin.update',
                "Mise à jour de l'intégration « {$integration->label} ».",
                [
                    'id' => $integration->id,
                    'provider' => $integration->provider,
                ],
                [Integration::class]
            );

            return back()->with('success', 'Intégration mise à jour.');
        } catch (\Throwable $e) {
            $logger->log(
                'integration.admin.update.error',
                "Erreur lors de la mise à jour de l'intégration « {$integration->label} » : ".$e->getMessage(),
                [
                    'id' => $integration->id,
                    'exception' => $e->getMessage(),
                ],
                [Integration::class]
            );

            return back()->with('error', 'Impossible de mettre à jour l’intégration.');
        }
    }

    /**
     * Delete the specified integration.
     */
    public function destroy(Integration $integration): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('integrations.manage');

            if ($integration->is_system) {
                return back()->with(
                    'error',
                    'Cette intégration système ne peut pas être supprimée.'
                );
            }

            $label = $integration->label;
            $provider = $integration->provider;
            $id = $integration->id;

            $integration->delete();

            $logger->log(
                'integration.admin.destroy',
                "Suppression de l'intégration « {$label} ».",
                [
                    'id' => $id,
                    'provider' => $provider,
                ],
                [Integration::class]
            );

            return back()->with('success', 'Intégration supprimée.');
        } catch (\Throwable $e) {
            $logger->log(
                'integration.admin.destroy.error',
                "Erreur lors de la suppression de l'intégration : ".$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Integration::class]
            );

            return back()->with('error', 'Impossible de supprimer l’intégration.');
        }
    }

    /**
     * Toggle the active status of the integration.
     */
    public function toggle(Integration $integration): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('integrations.manage');

            $integration->update([
                'is_active' => ! $integration->is_active,
            ]);

            $logger->log(
                'integration.admin.toggle',
                "Changement du statut de l'intégration « {$integration->label} ».",
                [
                    'id' => $integration->id,
                    'provider' => $integration->provider,
                    'is_active' => $integration->is_active,
                ],
                [Integration::class]
            );

            return back()->with('success', 'Statut mis à jour.');
        } catch (\Throwable $e) {
            $logger->log(
                'integration.admin.toggle.error',
                'Erreur lors du changement de statut : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [Integration::class]
            );

            return back()->with('error', 'Impossible de modifier le statut.');
        }
    }
}
