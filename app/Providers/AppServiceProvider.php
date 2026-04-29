<?php

namespace App\Providers;

use App\Models\Brief;
use App\Observers\BriefObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Brief::observe(BriefObserver::class);
    }
}
