<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Candidat extends Model
{
    use SoftDeletes;
    protected $table = 'candidats';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'current_title',
        'current_company',
        'location',
        'experience_years',
        'education_level',
        'source',
        'source_url',
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
            'experience_years' => 'integer',
        ];
    }
    
}
