<?php

namespace App\Services;

use App\Enums\BriefStatus;
use App\Models\Brief;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class BriefService
{
    private const FILTERABLE_FIELDS = [
        'title',
        'sector',
        'contract_type',
        'location',
        'salary_range',
        'min_experience_years',
        'education_level',
        'languages',
        'seniority_level',
        'target_companies',
        'gender_pref',
        'age_range',
        'status',
    ];

    /**
     * Apply an array of {field, value} filter pairs to a query.
     * Only fields in FILTERABLE_FIELDS are honoured.
     */
    public function applyFilters(Builder $query, array $filters): void
    {
        foreach ($filters as $filter) {
            if (
                ! is_array($filter) ||
                empty($filter['field']) ||
                ! isset($filter['value']) ||
                $filter['value'] === ''
            ) {
                continue;
            }

            if (! in_array($filter['field'], self::FILTERABLE_FIELDS, true)) {
                continue;
            }

            $query->where($filter['field'], 'like', '%'.$filter['value'].'%');
        }
    }

    /**
     * Return a paginated, shape-normalised list of briefs with filters and sorting applied.
     *
     * @param  array  $filters  Validated filter pairs from the request
     * @param  string  $sortBy  Column to sort by (already whitelisted by the controller)
     * @param  string  $sortDir  'asc' or 'desc'
     */
    public function getPaginatedBriefs(
        array $filters,
        string $sortBy = 'created_at',
        string $sortDir = 'desc',
    ): LengthAwarePaginator {
        $query = Brief::with('creator');

        $this->applyFilters($query, $filters);

        return $query
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->through(fn (Brief $brief) => [
                'id' => $brief->id,
                'title' => $brief->title,
                'sector' => $brief->sector,
                'contract_type' => $brief->contract_type,
                'location' => $brief->location,
                'min_experience_years' => $brief->min_experience_years,
                'education_level' => $brief->education_level,
                'gender_pref' => $brief->gender_pref,
                'status' => $brief->status,
                'created_by' => $brief->creator?->name,
                'created_at' => $brief->created_at->toDateTimeString(),
            ]);
    }

    /**
     * Create and persist a new brief owned by the given user.
     */
    public function createBrief(array $validated, int $userId): Brief
    {
        $brief = new Brief($validated);
        $brief->created_by = $userId;
        $brief->save();

        return $brief;
    }

    /**
     * Apply validated data to a brief and return a diff of changed fields.
     *
     * The diff has the shape: ['field' => ['avant' => old, 'après' => new], ...]
     *
     * @return array{brief: Brief, modifications: array}
     */
    public function updateBrief(Brief $brief, array $validated): array
    {
        $modifications = collect($validated)
            ->filter(fn ($newValue, string $key) => $brief->getAttribute($key) != $newValue)
            ->map(fn ($newValue, string $key) => [
                'avant' => $brief->getAttribute($key),
                'après' => $newValue,
            ])
            ->toArray();

        $brief->update($validated);

        return [
            'brief' => $brief,
            'modifications' => $modifications,
        ];
    }

    /**
     * Activate a brief by transitioning its status to Active.
     */
    public function activateBrief(Brief $brief): Brief
    {
        $brief->update(['status' => BriefStatus::Active]);

        return $brief;
    }
}
