<?php

namespace App\Services\Recruitment;

use App\Enums\ContractType;
use App\Models\Brief;
use Illuminate\Support\Collection;

/**
 * Converts a Brief model into an Apify actor input array
 * for the `harvestapi~linkedin-profile-search` actor.
 *
 * Example input (Brief attributes):
 * ```
 * title:                'Web Developer'
 * sector:               'Technology'
 * location:             'Rabat,Morocco'
 * required_skills:      'Python,MongoDB'
 * languages:            'Anglais,Arabe'
 * min_experience_years: 2
 * contract_type:        ContractType::Stage
 * ```
 *
 * Example output (Apify actor input):
 * ```php
 * [
 *     'profileScraperMode'       => 'Full',
 *     'maxItems'                 => 50,
 *     'takePages'                => 2,
 *     'searchQuery'              => 'Web Developer Python MongoDB Technology Anglais Arabe',
 *     'locations'                => ['Rabat', 'Morocco'],
 *     'yearsOfExperienceIds'     => [2],        // 2 = "1 to 2 years"
 *     'seniorityLevelIds'        => [100],       // 100 = In Training / Internship
 *     'postFilteringMongoDbQuery'=> [
 *         'skills' => [
 *             '$all' => [
 *                 ['$elemMatch' => ['name' => ['$regex' => '^Python$',  '$options' => 'i']]],
 *                 ['$elemMatch' => ['name' => ['$regex' => '^MongoDB$', '$options' => 'i']]],
 *             ],
 *         ],
 *     ],
 * ]
 * ```
 */
class BriefToQueryConverter
{
    /**
     * Convert a Brief into a full Apify actor input array.
     *
     * @param  Brief  $brief  The job brief to convert.
     * @return array Actor input ready to POST to the Apify API.
     */
    public function convert(Brief $brief): array
    {
        $input = [
            'profileScraperMode' => 'Full',
            'maxItems' => 50,
            'takePages' => 2,
        ];

        $searchTerms = $this->buildSearchQuery($brief);
        if ($searchTerms) {
            $input['searchQuery'] = $searchTerms;
        }

        if ($brief->location) {
            $input['locations'] = collect(explode(',', $brief->location))
                ->map(fn ($loc) => trim($loc))
                ->filter()
                ->values()
                ->toArray();
        }

        if ($brief->min_experience_years !== null) {
            $input['yearsOfExperienceIds'] = [$this->mapExperienceToId($brief->min_experience_years)];
        }

        if ($brief->contract_type) {
            $seniorityId = $this->mapContractTypeToSeniority($brief->contract_type);
            if ($seniorityId) {
                $input['seniorityLevelIds'] = [$seniorityId];
            }
        }

        $mongoFilter = $this->buildMongoFilter($brief);
        if ($mongoFilter) {
            $input['postFilteringMongoDbQuery'] = $mongoFilter;
        }

        return $input;
    }

    /**
     * Build a flat keyword search string from the brief's title, skills, sector, and languages.
     * Takes at most 5 skills to avoid overly narrow queries.
     *
     * @return string e.g. "Web Developer Python MongoDB Technology Anglais Arabe"
     */
    private function buildSearchQuery(Brief $brief): string
    {
        $parts = [];

        if ($brief->title) {
            $parts[] = trim($brief->title);
        }

        $skills = $this->parseMultiValue($brief->required_skills);
        if ($skills->isNotEmpty()) {
            $parts[] = $skills->implode(' ');
        }

        if ($brief->sector) {
            $parts[] = trim($brief->sector);
        }

        $languages = $this->parseMultiValue($brief->languages);
        if ($languages->isNotEmpty()) {
            $parts[] = $languages->implode(' ');
        }

        return implode(' ', array_filter($parts));
    }

    /**
     * Build a MongoDB $all query to post-filter scraped profiles,
     * keeping only candidates whose skills array contains ALL required skills
     * (case-insensitive exact match).
     *
     * @return array|null MongoDB query array, or null if no required skills are set.
     */
    private function buildMongoFilter(Brief $brief): ?array
    {
        if (! $brief->required_skills) {
            return null;
        }

        $skills = $this->parseMultiValue($brief->required_skills);

        if ($skills->isEmpty()) {
            return null;
        }

        return [
            'skills' => [
                '$all' => $skills->map(fn ($skill) => [
                    '$elemMatch' => [
                        'name' => [
                            '$regex' => '^'.preg_quote($skill, '/').'$',
                            '$options' => 'i',
                        ],
                    ],
                ])->values()->toArray(),
            ],
        ];
    }

    /**
     * Parse a delimited multi-value string (comma, newline, pipe, or semicolon)
     * into a clean collection of trimmed, non-empty strings.
     *
     * @param  string|null  $value  e.g. "Python,MongoDB" or "Python\nMongoDB"
     * @return Collection e.g. collect(['Python', 'MongoDB'])
     */
    private function parseMultiValue(?string $value): Collection
    {
        if (! $value) {
            return collect();
        }

        $normalized = preg_replace('/[\n\r|;]+/', ',', $value);

        return collect(explode(',', $normalized))
            ->map(fn ($s) => trim($s))
            ->filter(fn ($s) => strlen($s) > 1);
    }

    /**
     * Map min_experience_years to Apify's yearsOfExperienceIds.
     *
     * Apify scale:
     *   1 = Less than 1 year
     *   2 = 1 to 2 years
     *   3 = 3 to 5 years
     *   4 = 6 to 10 years
     *   5 = More than 10 years
     *
     * @param  int  $minYears  Minimum years of experience required.
     * @return int Apify experience tier ID.
     */
    private function mapExperienceToId(int $minYears): int
    {
        return match (true) {
            $minYears <= 0 => 1,
            $minYears <= 2 => 2,
            $minYears <= 5 => 3,
            $minYears <= 10 => 4,
            default => 5,
        };
    }

    /**
     * Map a ContractType enum value to an Apify LinkedIn seniority level ID.
     * Returns null when no seniority restriction should be applied.
     *
     * Apify seniority IDs:
     *   100 = In Training / Internship
     *   110 = Entry Level
     *   120 = Senior
     *   130 = Strategic
     *   200 = Entry Level Manager
     *   210 = Experienced Manager
     *   220 = Director
     *   300 = Vice President
     *   310 = CXO
     *   320 = Owner / Partner
     *
     * @return int|null Seniority ID, or null for no restriction.
     */
    private function mapContractTypeToSeniority(ContractType $type): ?int
    {
        return match ($type) {
            ContractType::CDI => null,
            ContractType::CDD => null,
            ContractType::Stage => 100,
            ContractType::Freelance => 120,
            default => null,
        };
    }
}
