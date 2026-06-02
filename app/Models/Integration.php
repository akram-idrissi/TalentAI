<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'provider', 'label', 'category', 'icon', 'description',
        'token_label', 'placeholder', 'env_key', 'test_url',
        'docs_url', 'oauth', 'is_active', 'is_system',
    ];

    protected $casts = [
        'oauth' => 'boolean',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];
}
