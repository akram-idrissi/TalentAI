<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class ActivityLog extends Model
{
    use SoftDeletes;
    protected $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'entity_type',
        'entity_id',
        'action',
        'metadata',
        'created_at',
       
    ];

    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------
    | Relationship
    |--------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
