<?php

namespace App\Services\Recruitment;

use App\Models\ApifyRun;
use App\Models\Brief;
use Illuminate\Support\Facades\Http;

class ApifyJobDispatcher
{
    private const ACTOR_ID = 'harvestapi~linkedin-profile-search';

    public function dispatch(Brief $brief, array $actorInput): ApifyRun
    {
        $response = Http::withToken(config('services.apify.token'))
            ->timeout(20)
            ->post('https://api.apify.com/v2/acts/'.self::ACTOR_ID.'/runs', $actorInput);

        $response->throw();

        return ApifyRun::create([
            'brief_id' => $brief->id,
            'run_id' => $response->json('data.id'),
            'status' => 'pending',
            'meta' => ['actor_input' => $actorInput],
        ]);
    }
}
