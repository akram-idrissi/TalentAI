
<?php

use App\Http\Controllers\ActivityLog\ActivityLogController;
use Illuminate\Support\Facades\Route;

Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index')->middleware('can:activity_logs.view');
Route::get('/activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activity-logs.show')->middleware('can:activity_logs.view');
