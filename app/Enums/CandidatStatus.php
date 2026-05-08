<?php

namespace App\Enums;

enum CandidatStatus: string
{
    case Sourced = 'sourced';
    case Contacted = 'contacted';
    case Interview = 'interview';
    case Recommended = 'recommended';
    case Offer = 'offer';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Sourced => 'Sourcé',
            self::Contacted => 'Contacté',
            self::Interview => 'Entretien',
            self::Recommended => 'Recommandé',
            self::Offer => 'Offre',
            self::Rejected => 'Rejeté',
        };
    }
}
