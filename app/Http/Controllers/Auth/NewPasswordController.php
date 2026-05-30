<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Show the password reset page.
     */
    public function create(Request $request): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'password.new.create',
                'Affichage de la page de réinitialisation du mot de passe.',
                ['email' => $request->email]
            );

            return Inertia::render('auth/reset-password', [
                'email' => $request->email,
                'token' => $request->route('token'),
            ]);
        } catch (\Throwable $e) {
            $logger->log(
                'password.new.create.error',
                'Erreur lors de l\'affichage de la page de réinitialisation : '.$e->getMessage(),
                ['exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user) use ($request) {
                    $user->forceFill([
                        'password' => Hash::make($request->password),
                        'remember_token' => Str::random(60),
                    ])->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status == Password::PasswordReset) {
                $logger->log(
                    'password.new.store',
                    'Mot de passe réinitialisé avec succès.',
                    ['email' => $request->email]
                );

                return to_route('login')->with('status', __($status));
            }

            $logger->log(
                'password.new.store.failed',
                'Échec de la réinitialisation du mot de passe.',
                ['email' => $request->email, 'status' => $status]
            );

            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'password.new.store.error',
                'Erreur lors de la réinitialisation du mot de passe : '.$e->getMessage(),
                ['email' => $request->email, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
