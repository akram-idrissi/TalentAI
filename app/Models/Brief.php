<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Brief extends Model
{   
    use SoftDeletes;
    protected $table = 'briefs';

    protected $fillable = [
        'created_by',
        'title',
        'sector',
        'contract_type',
        'location',
        'salary_range',
        'min_experience_years',
        'education_level',
        'gender_pref',
        'age_range',
        'mission_description',
        'required_skills',
        'soft_skills',
        'scoring_weights',
        'status',
       
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scoring_weights' => 'array',
            'min_experience_years' => 'integer',
        ];
    }

    /**
     * Relationship: Brief belongs to User
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
