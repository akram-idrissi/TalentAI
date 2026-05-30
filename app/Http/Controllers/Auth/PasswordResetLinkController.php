<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'password.reset_link.create',
                'Affichage de la page de demande de lien de réinitialisation.',
            );

            return Inertia::render('auth/forgot-password', [
                'status' => $request->session()->get('status'),
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'password.reset_link.create.error',
                'Erreur lors de l\'affichage de la page de réinitialisation : '.$e->getMessage(),
                ['exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'email' => 'required|email',
            ]);

            Password::sendResetLink($request->only('email'));

            $logger->log(
                'password.reset_link.store',
                'Demande de lien de réinitialisation traitée.',
                ['email' => $request->email]
            );

            return back()->with('status', __('A reset link will be sent if the account exists.'));
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'password.reset_link.store.error',
                'Erreur lors de l\'envoi du lien de réinitialisation : '.$e->getMessage(),
                ['email' => $request->email, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
