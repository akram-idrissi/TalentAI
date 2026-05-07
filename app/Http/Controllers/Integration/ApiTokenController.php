<?php

namespace App\Http\Controllers\Integration;

use App\Http\Controllers\Controller;
use App\Models\UserApiToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function index(): Response
    {
        $providers = config('integrations');
        $userTokens = auth()->user()->apiTokens()->get()->keyBy('provider');

        $categoryLabels = collect($providers)
            ->pluck('category')
            ->unique()
            ->mapWithKeys(fn ($cat) => [$cat => __("integrations.categories.{$cat}")]);

        $integrations = collect($providers)->map(function ($config, $key) use ($userTokens) {
            $record = $userTokens->get($key);

            return [
                // Identity
                'provider' => $key,
                'label' => $config['label'],
                'category' => $config['category'],

                'icon' => $config['icon'],
                'description' => $config['description'],
                'token_label' => $config['token_label'],
                'placeholder' => $config['placeholder'],
                'docs_url' => $config['docs_url'],
                'oauth' => $config['oauth'],

                'has_token' => (bool) $record,
                'masked_token' => $record ? $this->mask($record->token) : null,

                'has_env_fallback' => ! empty($config['env_key']) && env($config['env_key']),
            ];
        });

        return Inertia::render('Integration/Index', [
            'integrations' => $integrations,
            'categoryLabels' => $categoryLabels,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'provider' => ['required', 'string', Rule::in(array_keys(config('integrations')))],
            'token' => ['required', 'string', 'min:8'],
            'secondary_token' => ['nullable', 'string'],
        ]);

        $this->testToken($request->provider, $request->token);

        UserApiToken::updateOrCreate(
            ['user_id' => auth()->id(), 'provider' => $request->provider],
            [
                'token' => $request->token,
                'secondary_token' => $request->secondary_token,
            ]
        );

        return back()->with('success', 'Token enregistré.');
    }

    public function destroy(string $provider): RedirectResponse
    {
        UserApiToken::where('user_id', auth()->id())
            ->where('provider', $provider)
            ->delete();

        return back()->with('success', 'Token révoqué. Fallback .env actif.');
    }

    public function test(Request $request): RedirectResponse
    {
        $request->validate(['provider' => 'required']);

        try {
            $token = $request->token;
            if (! $token) {
                $record = UserApiToken::where('user_id', auth()->id())
                    ->where('provider', $request->provider)
                    ->firstOrFail();
                $token = $record->token;
            }

            $this->testToken($request->provider, $token);

            return back()->with('test_result', ['provider' => $request->provider, 'ok' => true]);
        } catch (\Exception $e) {
            return back()->with('test_result', ['provider' => $request->provider, 'ok' => false]);
        }
    }

    private function mask(string $token): string
    {
        $visible = substr($token, 0, 6);
        $end = substr($token, -4);

        return $visible.str_repeat('•', 12).$end;
    }

    private function testToken(string $provider, string $token): bool
    {
        $url = config("integrations.{$provider}.test_url");
        if (! $url) {
            return true;
        }

        $response = Http::withToken($token)->timeout(5)->get($url);
        logger()->info("Testing token for {$provider}", ['url' => $url, 'status' => $response->status(), 'response' => $response->body()]);
        if (! $response->successful()) {
            logger()->error("Token test failed for {$provider}", ['response' => $response->body()]);
            throw new \Exception("Token invalide pour {$provider}");
        }

        return true;
    }
}
