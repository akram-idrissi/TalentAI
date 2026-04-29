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

class DispatchBriefSourcingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Brief $brief) {}

    public function handle(BriefToQueryConverter $converter, ApifyJobDispatcher $dispatcher): void
    {
        $query = $converter->convert($this->brief);
        $run = $dispatcher->dispatch($this->brief, $query);
        FetchApifyResultsJob::dispatch($run)->delay(now()->addMinutes(1));
    }
}
