<?php

namespace App\Jobs;

use App\Models\Brief;
use App\Services\Recruitment\ApifyJobDispatcher;
use App\Services\Recruitment\BriefToQueryConverter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Triggered when a Brief becomes active.
 * Converts the brief into an Apify search query, dispatches the scraping run,
 * then schedules FetchApifyResultsJob to poll for results after a 1-minute delay.
 */
class DispatchBriefSourcingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  Brief  $brief  The active brief to source candidates for.
     */
    public function __construct(public Brief $brief) {}

    /**
     * Convert the brief to an Apify query, dispatch the scraping run,
     * and schedule the polling job.
     *
     * @param  BriefToQueryConverter  $converter  Builds the Apify actor input from the brief.
     * @param  ApifyJobDispatcher  $dispatcher  POSTs the run to Apify and creates an ApifyRun record.
     */
    public function handle(BriefToQueryConverter $converter, ApifyJobDispatcher $dispatcher): void
    {
        $query = $converter->convert($this->brief);
        $run = $dispatcher->dispatch($this->brief, $query);
        FetchApifyResultsJob::dispatch($run)->delay(now()->addMinutes(1));
    }
}
