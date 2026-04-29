<?php

namespace App\Observers;

use App\Enums\BriefStatus;
use App\Jobs\DispatchBriefSourcingJob;
use App\Models\Brief;

class BriefObserver
{
    public function updated(Brief $brief): void
    {
        if ($brief->wasChanged('status') && $brief->status === BriefStatus::Active) {
            DispatchBriefSourcingJob::dispatch($brief);
        }
    }
}
