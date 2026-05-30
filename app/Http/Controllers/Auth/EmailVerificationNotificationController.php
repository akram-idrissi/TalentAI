<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            if ($request->user()->hasVerifiedEmail()) {
                $logger->log(
                    'email.verification.already_verified',
                    'Tentative d\'envoi d\'un lien de vérification pour un e-mail déjà vérifié.',
                    ['user_id' => $request->user()->id, 'email' => $request->user()->email]
                );

                return redirect()->intended(route('dashboard', absolute: false));
            }

            $request->user()->sendEmailVerificationNotification();

            $logger->log(
                'email.verification.store',
                'Lien de vérification d\'e-mail envoyé avec succès.',
                ['user_id' => $request->user()->id, 'email' => $request->user()->email]
            );

            return back()->with('status', 'verification-link-sent');
        } catch (\Throwable $e) {
            $logger->log(
                'email.verification.store.error',
                'Erreur lors de l\'envoi du lien de vérification : '.$e->getMessage(),
                ['user_id' => $request->user()?->id, 'exception' => $e->getMessage()]
            );

            throw $e;
        }
    }
}
