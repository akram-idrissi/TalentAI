<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $logger->log(
                'user.register.create',
                'Affichage de la page d\'inscription.',
            );

            return Inertia::render('auth/register');
        } catch (\Throwable $e) {
            $logger->log(
                'user.register.create.error',
                'Erreur lors de l\'affichage de la page d\'inscription : '.$e->getMessage(),
                ['exception' => $e->getMessage()]
            );

            throw $e;
        }
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            event(new Registered($user));

            Auth::login($user);

            $logger->log(
                'user.register.store',
                "Nouvel utilisateur inscrit : « {$user->name} » (ID : {$user->id}).",
                ['user_id' => $user->id, 'email' => $user->email],
                [User::class]
            );

            return to_route('dashboard');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $logger->log(
                'user.register.store.error',
                'Erreur lors de l\'inscription : '.$e->getMessage(),
                ['email' => $request->email, 'exception' => $e->getMessage()],
                [User::class]
            );

            throw $e;
        }
    }
}
