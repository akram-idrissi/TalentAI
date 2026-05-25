<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParameterGroup extends Model
{
    protected $fillable = [
        'key',
        'label',
        'description',
        'is_active',
        'is_system',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    /**
     * All values (active + inactive) — used in admin management.
     */
    public function values(): HasMany
    {
        return $this->hasMany(ParameterValue::class, 'group_id')
            ->orderBy('order')
            ->orderBy('id');
    }

    /**
     * Only active values — used when populating dropdowns.
     */
    public function activeValues(): HasMany
    {
        return $this->hasMany(ParameterValue::class, 'group_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('id');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
