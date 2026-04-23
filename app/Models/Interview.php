<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Interview extends Model
{
    use SoftDeletes;
    protected $table = 'interviews';


    protected $fillable = [
        'candidate_id',
        'brief_id',
        'interviewer_id',
        'platform',
        'recording_url',
        'duration_seconds',
        'status',
        'scheduled_at',
        'completed_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }
    /*
    |--------------------------------
    | Relationships
    |--------------------------------
    */

    public function candidate()
    {
        return $this->belongsTo(Candidat::class, 'candidate_id');
    }

    public function brief()
    {
        return $this->belongsTo(Brief::class, 'brief_id');
    }

    public function interviewer()
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}
