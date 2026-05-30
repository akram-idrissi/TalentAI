<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SourcingResult extends Model
{
    use SoftDeletes;

    protected $table = 'sourcing_results';

    protected $fillable = [
        'brief_id',
        'candidate_id',
        'platform',
        'profile_url',
        'ai_score',
        'retained',
        'rejection_reason',
        'sourced_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'retained' => 'boolean',
            'ai_score' => 'integer',
            'sourced_at' => 'datetime',
        ];
    }

    public function brief()
    {
        return $this->belongsTo(Brief::class, 'brief_id');
    }

    public function candidate()
    {
        return $this->belongsTo(Candidat::class, 'candidate_id');
    }
}
