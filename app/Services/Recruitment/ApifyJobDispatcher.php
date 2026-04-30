<?php

namespace App\Services\Recruitment;

use App\Models\ApifyRun;
use App\Models\Brief;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

/**
 * Sends a scraping job to the Apify LinkedIn profile search actor
 * and persists a pending ApifyRun record to track it.
 */
class ApifyJobDispatcher
{
    private const ACTOR_ID = 'harvestapi~linkedin-profile-search';

    /**
     * POST the actor input to Apify and create a local ApifyRun record.
     *
     * @param  Brief  $brief  The brief this run is sourcing candidates for.
     * @param  array  $actorInput  The query payload built by BriefToQueryConverter.
     * @return ApifyRun The newly created run record with status 'pending'.
     *
     * @throws RequestException If the Apify API returns a non-2xx response.
     */
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
