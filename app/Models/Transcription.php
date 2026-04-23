<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Transcription extends Model
{
    use SoftDeletes;
    protected $table = 'transcriptions';

    protected $fillable = [
        'interview_id',
        'transcript_text',
        'whisper_confidence',
        'language',
        'progress_pct',
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
            'whisper_confidence' => 'float',
        'progress_pct' => 'integer',
        'created_at' => 'datetime',
        ];
    }
    

    /*
    |--------------------------------
    | Relationship
    |--------------------------------
    */

    public function interview()
    {
        return $this->belongsTo(Interview::class, 'interview_id');
    }
}
