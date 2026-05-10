<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserApiToken extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'token',
        'secondary_token',

    ];

    protected $casts = [
        'token' => 'encrypted',
        'secondary_token' => 'encrypted',
    ];

    protected $hidden = ['token', 'secondary_token'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
