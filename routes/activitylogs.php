
<?php

use App\Http\Controllers\ActivityLog\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
Route::get('/activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activity-logs.show');
