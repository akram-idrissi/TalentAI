<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_role',
        'is_authenticated',
        'action',
        'description',
        'controller',
        'controller_method',
        'http_method',
        'url',
        'ip_address',
        'user_agent',
        'request_data',
        'models',
        'properties',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'is_authenticated' => 'boolean',
            'request_data' => 'array',
            'models' => 'array',
            'properties' => 'array',
            'logged_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
