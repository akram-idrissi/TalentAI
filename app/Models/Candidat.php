<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Candidat extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'candidats';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'linkedin_url',
        'headline',
        'location',
        'summary',
        'skills',
        'current_company',
        'current_title',
        'experience_years',
        'education_level',
        'sector',
        'open_to_work',
        'source',
        'raw_data',
        'source_url',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'skills' => 'json',
        'raw_data' => 'json',
        'open_to_work' => 'boolean',
        'experience_years' => 'float',
    ];

    /**
     * Relationship: A candidate can have many interviews.
     */
    public function interviews()
    {
        return $this->hasMany(Interview::class, 'candidate_id');
    }

    /**
     * Relationship: A candidate can have many sourcing results.
     */
    public function sourcingResults()
    {
        return $this->hasMany(SourcingResult::class, 'candidate_id');
    }

    /**
     * Relationship: A candidate can have many CV analyses.
     */
    public function cvAnalyses()
    {
        return $this->hasMany(CvAnalysis::class, 'candidate_id');
    }
}
