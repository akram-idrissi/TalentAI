<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class CvAnalysis extends Model
{   
    use SoftDeletes;
    protected $table = 'cv_analyses';

    protected $fillable = [
        'candidate_id',
        'brief_id',
        'extracted_text',
        'score_global',
        'score_experience',
        'score_education',
        'score_sector',
        'score_softskills',
        'score_location',
        'ai_summary',
        'ai_tags',
        'analyzed_at',
    ];

    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
             'ai_tags' => 'array',
            'analyzed_at' => 'datetime'
        ];
    }

    /*
    |-----------------------------
    | Relationships
    |-----------------------------
    */

    public function candidate()
    {
        return $this->belongsTo(Candidat::class, 'candidate_id');
    }

    public function brief()
    {
        return $this->belongsTo(Brief::class, 'brief_id');
    }

}
