<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BriefQueryHistory extends Model
{
    public $timestamps = false;

    protected $fillable = ['brief_id', 'query', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            $model->created_at = now();
        });
    }

    public function brief(): BelongsTo
    {
        return $this->belongsTo(Brief::class);
    }
}
