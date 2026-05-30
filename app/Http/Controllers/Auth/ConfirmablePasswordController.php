<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password page.
     */
    public function show(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'password.confirm.show',
                'Affichage de la page de confirmation de mot de passe.',
            );

            return Inertia::render('auth/confirm-password');
        } catch (\Throwable $e) {
            $logger->log(
                'password.confirm.show.error',
                'Erreur lors de l\'affichage de la page de confirmation : '.$e->getMessage(),
                ['exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            if (! Auth::guard('web')->validate([
                'email' => $request->user()->email,
                'password' => $request->password,
            ])) {
                $logger->log(
                    'password.confirm.store.failed',
                    'Échec de la confirmation du mot de passe.',
                    ['email' => $request->user()->email]
                );

                throw ValidationException::withMessages([
                    'password' => __('auth.password'),
                ]);
            }

            $request->session()->put('auth.password_confirmed_at', time());

            $logger->log(
                'password.confirm.store',
                'Mot de passe confirmé avec succès.',
                ['email' => $request->user()->email]
            );

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'password.confirm.store.error',
                'Erreur lors de la confirmation du mot de passe : '.$e->getMessage(),
                ['exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
