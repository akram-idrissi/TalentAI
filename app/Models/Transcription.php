<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transcription extends Model
{
    use SoftDeletes;

    protected $table = 'transcriptions';

    protected $fillable = [
        // 'interview_id',
        'transcript_text',
        // 'whisper_confidence',
        // 'language',
        // 'progress_pct',
        // 'created_at',
        'audio_path',
        'status',
        'diarized_transcript',
        'error',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // 'whisper_confidence' => 'float',
            // 'progress_pct' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // public function interview()
    // {
    //     return $this->belongsTo(Interview::class, 'interview_id');
    // }
}
