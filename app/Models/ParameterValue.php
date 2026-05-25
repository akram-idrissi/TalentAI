<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParameterValue extends Model
{
    protected $fillable = [
        'group_id',
        'value',
        'label',
        'order',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
        'order' => 'integer',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ParameterGroup::class, 'group_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Return as a {value, label} array ready for the frontend SelectOption type.
     */
    public function toSelectOption(): array
    {
        return [
            'value' => $this->value,
            'label' => $this->label,
        ];
    }
}
