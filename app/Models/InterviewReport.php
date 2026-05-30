<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InterviewReport extends Model
{
    use SoftDeletes;

    protected $table = 'interview_reports';

    protected $fillable = [
        'interview_id',
        'candidate_id',
        'brief_id',
        'score_global',
        'score_communication',
        'score_strategy',
        'score_leadership',
        'score_team_mgmt',
        'score_culture_fit',
        'score_salary_fit',
        'strengths',
        'watch_points',
        'key_excerpts',
        'verdict',
        'ai_recommendation',
        'generated_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key_excerpts' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function interview()
    {
        return $this->belongsTo(Interview::class, 'interview_id');
    }

    public function candidate()
    {
        return $this->belongsTo(Candidat::class, 'candidate_id');
    }

    public function brief()
    {
        return $this->belongsTo(Brief::class, 'brief_id');
    }
}
