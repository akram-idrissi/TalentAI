<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\ActivityLogger;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'settings.profile.edit',
                'Affichage de la page des paramètres de profil.',
                ['user_id' => $request->user()->id]
            );

            return Inertia::render('settings/profile', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => $request->session()->get('status'),
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'settings.profile.edit.error',
                'Erreur lors de l\'affichage du profil : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->user()->fill($request->validated());

            $emailChanged = $request->user()->isDirty('email');

            if ($emailChanged) {
                $request->user()->email_verified_at = null;
            }

            $request->user()->save();

            $logger->log(
                'settings.profile.update',
                'Profil mis à jour avec succès.',
                [
                    'user_id' => $request->user()->id,
                    'email_changed' => $emailChanged,
                ]
            );

            return to_route('profile.edit');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'settings.profile.update.error',
                'Erreur lors de la mise à jour du profil : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);

            $user = $request->user();
            $userId = $user->id;
            $email = $user->email;

            Auth::logout();
            $user->delete();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $logger->log(
                'settings.profile.destroy',
                "Compte supprimé pour l'utilisateur (ID : {$userId}, e-mail : {$email}).",
                ['user_id' => $userId, 'email' => $email]
            );

            return redirect('/');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'settings.profile.destroy.error',
                'Erreur lors de la suppression du compte : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
