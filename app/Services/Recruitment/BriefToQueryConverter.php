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
            'maxItems' => 100,
            'takePages' => 4,
        ];

        if ($brief->title) {
            $input['currentJobTitles'] = [trim($brief->title)];
        }

        if ($brief->location) {
            $input['locations'] = [trim($brief->location)];
        }

        if ($brief->min_experience_years !== null) {
            $input['yearsOfExperienceIds'] = [
                (string) $this->mapExperienceToId($brief->min_experience_years),
            ];
        }

        // Seniority — prefer the explicit seniority_level field; fall back to contract_type mapping
        if ($brief->seniority_level) {
            $seniorityId = $this->mapSeniorityLevel($brief->seniority_level);
            if ($seniorityId) {
                $input['seniorityLevelIds'] = [(string) $seniorityId];
            }
        } elseif ($brief->contract_type) {
            $seniorityId = $this->mapContractTypeToSeniority($brief->contract_type);
            if ($seniorityId) {
                $input['seniorityLevelIds'] = [(string) $seniorityId];
            }
        }

        // Profile languages (e.g. "Français, Anglais" → ["fr", "en"])
        if ($brief->languages) {
            $langs = $this->parseMultiValue($brief->languages)
                ->map(fn ($l) => $this->mapLanguageToCode($l))
                ->filter()
                ->values()
                ->all();

            if (! empty($langs)) {
                $input['profileLanguages'] = $langs;
            }
        }

        // Target companies (current company filter)
        if ($brief->target_companies) {
            $companies = $this->parseMultiValue($brief->target_companies)
                ->values()
                ->all();

            if (! empty($companies)) {
                $input['currentCompanies'] = $companies;
            }
        }

        $mongoFilter = $this->buildMongoFilter($brief);
        if ($mongoFilter) {
            $input['postFilteringMongoDbQuery'] = $mongoFilter;
        }

        logger()->info('Apify input', $input);

        return $input;
    }

    /**
     * Build a flat keyword search string from the brief's title, skills, sector, and languages.
     * Takes at most 5 skills to avoid overly narrow queries.
     *
     * @return string e.g. "Web Developer Python MongoDB Technology Anglais Arabe"
     */
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
     * Map an explicit seniority_level value to an Apify seniority ID.
     *
     * Apify IDs: 100=Internship, 110=Entry, 120=Senior, 130=Strategic,
     *            200=Entry Manager, 210=Experienced Manager, 220=Director,
     *            300=VP, 310=CXO, 320=Owner
     */
    private function mapSeniorityLevel(string $level): ?int
    {
        return match ($level) {
            'intern' => 100,
            'entry' => 110,
            'mid' => 110,
            'senior' => 120,
            'manager' => 210,
            'director' => 220,
            'executive' => 310,
            default => null,
        };
    }

    /**
     * Map a French language name to the full English name Apify expects.
     */
    private function mapLanguageToCode(string $language): ?string
    {
        return match (mb_strtolower(trim($language))) {
            'anglais' => 'English',
            'français', 'francais' => 'French',
            'arabe' => 'Arabic',
            'espagnol' => 'Spanish',
            'amazigh' => null, // not a standard LinkedIn profile language
            default => null,
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
    private function mapContractTypeToSeniority(string|ContractType $type): ?int
    {
        if (is_string($type)) {
            $type = ContractType::from($type);
        }

        return match ($type) {
            ContractType::CDI => null,
            ContractType::CDD => null,
            ContractType::Stage => 100,
            ContractType::Freelance => 120,
            default => null,
        };
    }
}
