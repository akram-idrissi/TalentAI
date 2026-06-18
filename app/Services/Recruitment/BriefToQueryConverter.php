<?php

namespace App\Services\Recruitment;

use App\Enums\ContractType;
use App\Models\Brief;
use Illuminate\Support\Collection;

/**
 * Converts a Brief model into an Apify actor input array
 * for the `harvestapi~linkedin-profile-search` actor.
 *
 * Current mode: uses `job_title_query` — a pre-built LinkedIn Boolean string
 * (e.g. "commercial" NOT (responsable OR directeur)) — passed into currentJobTitles.
 *
 * NOTE: broad/exact mode switching is temporarily disabled while we validate
 * the AI-generated query approach. The mode logic is preserved below in comments
 * and can be re-enabled once we have enough data on result quality.
 *
 * Options accepted by convert():
 *   open_to_work      (bool)          default: false
 *   job_title_query   (string|null)   AI-generated Boolean title query
 */
class BriefToQueryConverter
{
    /**
     * Convert a Brief + search options into a full Apify actor input array.
     *
     * @param  Brief  $brief  The job brief to convert.
     * @param  array  $options  Search behaviour overrides (see class docblock).
     * @return array Actor input ready to POST to the Apify API.
     */
    public function convert(Brief $brief, array $options = []): array
    {
        $openToWork = (bool) ($options['open_to_work'] ?? false);
        $jobTitleQuery = $options['job_title_query'] ?? null;
        $startPage = max(1, (int) ($options['start_page'] ?? 1));
        $takePages = max(1, (int) ($options['take_pages'] ?? 4));

        $input = [
            'profileScraperMode' => 'Full',
            'maxItems' => $takePages * 25,
            'startPage' => $startPage,
            'takePages' => $takePages,
        ];

        // --- Job title query ---
        // Uses the AI-generated Boolean string (e.g. "commercial" NOT (responsable OR directeur)).
        // Falls back to a plain quoted title if no query was provided.
        if ($jobTitleQuery) {
            $input['currentJobTitles'] = [mb_substr(trim($jobTitleQuery), 0, 300)];
        } elseif ($brief->title) {
            $input['currentJobTitles'] = ['"'.trim($brief->title).'"'];
        }

        /*
         * BROAD / EXACT MODE — disabled while validating AI-generated query approach.
         * Re-enable when switching back to manual mode selection.
         *
         * if ($mode === 'broad') {
         *     $searchQuery = $this->buildSearchQuery($brief, $extraKeywords);
         *     if ($searchQuery) {
         *         $input['searchQuery'] = $searchQuery;
         *     }
         * } else {
         *     // exact: currentJobTitles already set above
         * }
         */

        // --- Location ---
        if ($brief->location) {
            $input['locations'] = array_filter(
                array_map('trim', explode(',', $brief->location))
            );
        }

        // --- Experience ---
        if ($brief->min_experience_years !== null) {
            $input['yearsOfExperienceIds'] = [
                (string) $this->mapExperienceToId($brief->min_experience_years),
            ];
        }

        // --- Seniority ---
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

        // --- Profile languages ---
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

        // --- Target companies ---
        if ($brief->target_companies) {
            $companies = $this->parseMultiValue($brief->target_companies)->values()->all();
            if (! empty($companies)) {
                $input['currentCompanies'] = $companies;
            }
        }

        // --- Candidate state filters ---
        if ($openToWork) {
            $input['openToWork'] = true;
        }

        /*
         * POST-FILTER (MongoDB query) — disabled while validating AI-generated query approach.
         * The Boolean query in currentJobTitles already filters at the LinkedIn search level.
         * Re-enable if result quality degrades and we need a second pass.
         *
         * if (! $jobTitleQuery) {
         *     $mongoFilter = $this->buildExactMongoFilter($brief);
         *     if ($mongoFilter) {
         *         $input['postFilteringMongoDbQuery'] = $mongoFilter;
         *     }
         * }
         */

        /*
         * BROAD MODE POST-FILTER — disabled with broad mode.
         *
         * $mongoFilter = $mode === 'broad'
         *     ? $this->buildBroadMongoFilter($brief)
         *     : $this->buildExactMongoFilter($brief);
         */

        logger()->info('[BriefToQueryConverter] Actor input built', $input);

        return $input;
    }

    /**
     * Exact mode post-filter: headline checked first, then currentPosition.title.
     * The Apify `currentJobTitles` filter already handles LinkedIn-side filtering;
     * this confirms the match in the raw dataset.
     */
    private function buildExactMongoFilter(Brief $brief): ?array
    {
        if (! $brief->title) {
            return null;
        }

        $pattern = '^\\s*'.preg_quote(trim($brief->title), '/').'(\\s*$|[\\s|@,\\-])';

        return [
            '$or' => [
                [
                    'currentPosition' => [
                        '$elemMatch' => [
                            'title' => ['$regex' => $pattern, '$options' => 'i'],
                        ],
                    ],
                ],
                [
                    'headline' => ['$regex' => $pattern, '$options' => 'i'],
                ],
            ],
        ];
    }

    /*
     * BROAD MODE POST-FILTER — disabled with broad mode.
     *
     * private function buildBroadMongoFilter(Brief $brief): ?array
     * {
     *     if (! $brief->title) { return null; }
     *     $keywords = collect(preg_split('/\s+/', trim($brief->title)))
     *         ->map(fn ($w) => trim($w, '.,;:-'))
     *         ->filter(fn ($w) => strlen($w) >= 3)
     *         ->values();
     *     if ($keywords->isEmpty()) { return null; }
     *     $pattern = $keywords->map(fn ($k) => preg_quote($k, '/'))->implode('|');
     *     return [
     *         '$or' => [
     *             ['headline' => ['$regex' => $pattern, '$options' => 'i']],
     *             ['currentPosition' => ['$elemMatch' => ['title' => ['$regex' => $pattern, '$options' => 'i']]]],
     *         ],
     *     ];
     * }
     */

    /**
     * Parse a delimited multi-value string (comma, newline, pipe, or semicolon)
     * into a clean collection of trimmed, non-empty strings.
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
            'amazigh' => null,
            default => null,
        };
    }

    /**
     * Map a ContractType enum value to an Apify LinkedIn seniority level ID.
     * Returns null when no seniority restriction should be applied.
     */
    private function mapContractTypeToSeniority(string|ContractType $type): ?int
    {
        if (\is_string($type)) {
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
