<?php

namespace App\Http\Controllers\ActivityLog;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display a paginated, filterable list of activity logs.
     *
     * @param  Request  $request  Supports: `search` (string), `action` (string), `user` (string), `date_from` (Y-m-d), `date_to` (Y-m-d)
     * @return Response Inertia page — ActivityLogs/Index — or Fallback on failure
     */
    public function index(Request $request): Response
    {
        $this->authorize('activity_logs.view');

        try {
            $search = $request->string('search')->trim()->toString();
            $action = $request->string('action')->trim()->toString();
            $user = $request->string('user')->trim()->toString();
            $dateFrom = $request->string('date_from')->trim()->toString();
            $dateTo = $request->string('date_to')->trim()->toString();

            $logs = ActivityLog::query()
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($inner) use ($search) {
                        $inner->where('description', 'like', "%{$search}%")
                            ->orWhere('action', 'like', "%{$search}%")
                            ->orWhere('user_name', 'like', "%{$search}%")
                            ->orWhere('user_email', 'like', "%{$search}%");
                    });
                })
                ->when($action, fn ($q) => $q->where('action', 'like', "%{$action}%"))
                ->when($user, fn ($q) => $q->where(function ($inner) use ($user) {
                    $inner->where('user_name', 'like', "%{$user}%")
                        ->orWhere('user_email', 'like', "%{$user}%");
                }))
                ->when($dateFrom, fn ($q) => $q->whereDate('logged_at', '>=', $dateFrom))
                ->when($dateTo, fn ($q) => $q->whereDate('logged_at', '<=', $dateTo))
                ->orderByDesc('logged_at')
                ->paginate(25)
                ->withQueryString()
                ->through(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user_id' => $log->user_id,
                    'user_name' => $log->user_name,
                    'user_email' => $log->user_email,
                    'user_role' => $log->user_role,
                    'is_authenticated' => $log->is_authenticated,
                    'controller' => $log->controller,
                    'controller_method' => $log->controller_method,
                    'http_method' => $log->http_method,
                    'url' => $log->url,
                    'ip_address' => $log->ip_address,
                    'properties' => $log->properties,
                    'models' => $log->models,
                    'logged_at' => $log->logged_at,
                ]);

            // Distinct action prefixes for the filter dropdown  (e.g. "brief", "users", "roles")
            $actionGroups = ActivityLog::query()
                ->selectRaw('DISTINCT SUBSTRING_INDEX(action, ".", 1) as prefix')
                ->orderBy('prefix')
                ->pluck('prefix');

            return Inertia::render('ActivityLogs/Index', [
                'logs' => $logs,
                'actionGroups' => $actionGroups,
                'filters' => compact('search', 'action', 'user', 'dateFrom', 'dateTo'),
            ]);
        } catch (\Throwable $e) {
            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger les journaux d\'activité.',
            ]);
        }
    }

    /**
     * Display the full detail of a single activity log entry.
     *
     * @param  ActivityLog  $activityLog  Route-model-bound instance
     * @return Response Inertia page — ActivityLogs/Show — or Fallback on failure
     */
    public function show(ActivityLog $activityLog): Response
    {
        $this->authorize('activity_logs.view');

        try {
            return Inertia::render('ActivityLogs/Show', [
                'log' => $activityLog,
            ]);
        } catch (\Throwable $e) {
            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher ce journal.',
            ]);
        }
    }
}
