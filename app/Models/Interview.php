<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; // Required for UUIDs
use Illuminate\Database\Eloquent\SoftDeletes;

class Interview extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'interviews';

    /**
     * The attributes that are mass assignable.
     * * Note: 'video_path' stores the local storage path.
     */
    protected $fillable = [
        'candidate_id',
        'brief_id',
        'interviewer_id',
        'platform',
        'video_path', // Updated to match Controller logic
        'duration_seconds',
        'status',
        'scheduled_at',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];

    /**
     * Relationship: An interview belongs to a candidate.
     */
    public function candidate()
    {
        // Using 'Candidat' model as per your naming convention
        return $this->belongsTo(Candidat::class, 'candidate_id');
    }

    /**
     * Relationship: An interview belongs to a recruitment brief.
     */
    public function brief()
    {
        return $this->belongsTo(Brief::class, 'brief_id');
    }

    /**
     * Relationship: An interview is conducted by an interviewer (User).
     */
    public function interviewer()
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}
