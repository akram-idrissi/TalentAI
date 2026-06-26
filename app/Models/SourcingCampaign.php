<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SourcingCampaign extends Model
{
    protected $fillable = [
        'target_urls',
        'max_posts',
        'posted_limit_date',
        'brief_id',
        'status',
        'apify_run_id',
        'apify_dataset_id',
        'poll_attempts',
        'error_message',
    ];

    protected $casts = [
        'target_urls' => 'array',
        'posted_limit_date' => 'date',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function brief(): BelongsTo
    {
        return $this->belongsTo(Brief::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(SocialPost::class);
    }

    /**
     * All Candidat rows sourced from this run's commenters.
     */
    public function candidats(): HasManyThrough
    {

        return $this->hasManyThrough(
            Candidat::class,
            SocialComment::class,
            'social_post_id',
            'linkedin_url',
            'id',
            'commenter_linkedin_url',
        );

    }
}
