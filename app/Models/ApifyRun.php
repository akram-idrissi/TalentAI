<?php

// app/Models/ApifyRun.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApifyRun extends Model
{
    protected $fillable = [
        'brief_id',
        'run_id',
        'status',
        'dataset_id',
        'candidates_imported',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function brief(): BelongsTo
    {
        return $this->belongsTo(Brief::class);
    }
}
