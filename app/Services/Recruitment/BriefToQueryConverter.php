<?php

namespace App\Services\Recruitment;

use App\Enums\ContractType;
use App\Models\Brief;
use Illuminate\Support\Collection;

class BriefToQueryConverter
{
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
                ->map(fn ($loc) => $this->normalizeLocation($loc))
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

    private function buildSearchQuery(Brief $brief): string
    {
        $parts = [];

        if ($brief->title) {
            $parts[] = trim($brief->title);
        }
        $skills = $this->parseMultiValue($brief->required_skills);
        if ($skills->isNotEmpty()) {
            $parts[] = $skills->take(5)->implode(' ');
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
     * Map your ContractType enum to LinkedIn seniority level IDs.
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
