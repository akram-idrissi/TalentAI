<?php

namespace Database\Seeders;

use App\Models\Integration;
use Illuminate\Database\Seeder;

class IntegrationSeeder extends Seeder
{
    public function run(): void
    {
        $integrations = [

            [
                'provider' => 'AssemblyAI',
                'label' => 'AssemblyAI',
                'category' => 'ai',
                'icon' => 'Mic',
                'description' => 'Transcription audio des entretiens (Whisper)',
                'token_label' => 'Clé API AssemblyAI',
                'placeholder' => 'xxxxxxxxxxxxxxxxxxxx',
                'env_key' => 'ASSEMBLYAI_API_KEY',
                'test_url' => 'https://api.assemblyai.com/v2/account',
                'docs_url' => 'https://www.assemblyai.com/docs',
                'oauth' => false,
            ],
            [
                'provider' => 'anthropic',
                'label' => 'Claude API (Anthropic)',
                'category' => 'ai',
                'icon' => 'Bot',
                'description' => 'Analyse IA centrale · Claude Sonnet 4',
                'token_label' => 'Clé API Anthropic',
                'placeholder' => 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'env_key' => 'ANTHROPIC_API_KEY',
                'test_url' => 'https://api.anthropic.com/v1/models',
                'docs_url' => 'https://docs.anthropic.com',
                'oauth' => false,
            ],
            [
                'provider' => 'open_router',
                'label' => 'OpenRouter',
                'category' => 'ai',
                'icon' => 'Bot',
                'description' => 'Accès à plusieurs modèles IA via OpenRouter',
                'token_label' => 'Clé API OpenRouter',
                'placeholder' => 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'env_key' => 'OPEN_ROUTER_KEY',
                'test_url' => 'https://openrouter.ai/api/v1/models',
                'docs_url' => 'https://openrouter.ai/docs',
                'oauth' => false,
            ],
            [
                'provider' => 'gemini',
                'label' => 'Gemini',
                'category' => 'ai',
                'icon' => 'Bot',
                'description' => 'Accès à plusieurs modèles IA via Gemini',
                'token_label' => 'Clé API Gemini',
                'placeholder' => 'sk-gem-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'env_key' => 'GEMINI_API_KEY',
                'test_url' => 'https://generativelanguage.googleapis.com/v1beta/models',
                'docs_url' => 'https://ai.google.dev/gemini-api',
                'oauth' => false,
            ],

            [
                'provider' => 'apify',
                'label' => 'Apify',
                'category' => 'sourcing',
                'icon' => 'Workflow',
                'description' => 'Sourcing depuis des crawlers personnalisés',
                'token_label' => 'Token API Apify',
                'placeholder' => 'apify_xxxxxxxxxxxxxxxxxxxx',
                'env_key' => 'APIFY_API_TOKEN',
                'test_url' => 'https://api.apify.com/v2/actor-tasks',
                'docs_url' => 'https://apify.com/docs',
                'oauth' => false,
            ],

        ];

        foreach ($integrations as $data) {
            Integration::updateOrCreate(
                ['provider' => $data['provider']],
                array_merge($data, [
                    'is_active' => true,
                    'is_system' => true,
                ])
            );
        }
    }
}
