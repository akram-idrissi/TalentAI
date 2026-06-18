<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApifyRun extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'brief_id',
        'user_id',
        'run_id',
        'status',
        'dataset_id',
        'candidates_imported',
        'dataset_offset',
        'total_items',
        'paused_at',
        'meta',
        'search_params',
    ];

    protected $casts = [
        'meta' => 'array',
        'search_params' => 'array',
        'dataset_offset' => 'integer',
        'total_items' => 'integer',
        'candidates_imported' => 'integer',
        'paused_at' => 'datetime',
    ];

    public function brief(): BelongsTo
    {
        return $this->belongsTo(Brief::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
