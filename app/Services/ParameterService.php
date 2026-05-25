<?php

namespace App\Services;

use App\Models\ParameterGroup;
use App\Models\ParameterValue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ParameterService
{
    private const CACHE_TTL = 3600;

    private const CACHE_PREFIX = 'params.';

    /**
     * Get a single group's active values as [{value, label}] — ready for the frontend.
     *
     * Usage: $params->getGroup('sectors')
     */
    public function getGroup(string $key): Collection
    {
        return Cache::remember(self::CACHE_PREFIX.$key, self::CACHE_TTL, function () use ($key) {
            $group = ParameterGroup::where('key', $key)
                ->where('is_active', true)
                ->with('activeValues')
                ->firstOrFail();

            return $group->activeValues->map(fn (ParameterValue $v) => $v->toSelectOption());
        });
    }

    /**
     * Get multiple groups at once — ideal for Inertia page props.
     *
     * Usage: $params->getAll(['sectors', 'education_levels', ...])
     * Returns: ['sectors' => [...], 'education_levels' => [...]]
     */
    public function getAll(array $keys): array
    {
        return collect($keys)
            ->mapWithKeys(fn (string $key) => [$key => $this->getGroup($key)])
            ->toArray();
    }

    /**
     * Check whether a given value exists and is active in a group.
     * Use this in FormRequests to validate submitted option values.
     *
     * Usage: $params->isValid('sectors', $request->sector)
     */
    public function isValid(string $groupKey, string $value): bool
    {
        return $this->getGroup($groupKey)
            ->contains('value', $value);
    }

    /**
     * Invalidate the cache for one or more groups.
     * Call this after any admin create / update / delete / reorder.
     */
    public function invalidate(string|array $keys): void
    {
        foreach ((array) $keys as $key) {
            Cache::forget(self::CACHE_PREFIX.$key);
        }
    }

    /**
     * Invalidate cache for ALL parameter groups.
     * Useful after bulk imports or major admin changes.
     */
    public function invalidateAll(): void
    {
        $keys = ParameterGroup::pluck('key');
        foreach ($keys as $key) {
            Cache::forget(self::CACHE_PREFIX.$key);
        }
    }
}
