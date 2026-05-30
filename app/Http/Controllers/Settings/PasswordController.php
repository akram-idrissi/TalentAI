<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'settings.password.edit',
                'Affichage de la page des paramètres de mot de passe.',
                ['user_id' => $request->user()->id]
            );

            return Inertia::render('settings/password', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => $request->session()->get('status'),
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'settings.password.edit.error',
                'Erreur lors de l\'affichage des paramètres de mot de passe : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $validated = $request->validate([
                'current_password' => ['required', 'current_password'],
                'password' => ['required', Password::defaults(), 'confirmed'],
            ]);

            $request->user()->update([
                'password' => Hash::make($validated['password']),
            ]);

            $logger->log(
                'settings.password.update',
                'Mot de passe mis à jour avec succès.',
                ['user_id' => $request->user()->id]
            );

            return back();
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'settings.password.update.error',
                'Erreur lors de la mise à jour du mot de passe : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
