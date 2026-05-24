<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transcription extends Model
{
    use SoftDeletes;

    protected $table = 'transcriptions';

    protected $fillable = [

        'interview_id',
        'transcript_text',
        'audio_path',
        'status',
        'diarized_transcript',
        'error',
        'analysis_status',
        'analysis_score',
        'analysis_verdict',
        'analysis_result',
        'analysis_error',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'analysis_result' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function interview(): BelongsTo
    {
        return $this->belongsTo(Interview::class, 'interview_id');
    }
}
