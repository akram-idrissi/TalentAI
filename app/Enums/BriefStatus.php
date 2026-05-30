<?php

namespace App\Enums;

enum BriefStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Sourcing = 'sourcing';
    case Interviews = 'interviews';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Active => 'Active',
            self::Sourcing => 'Sourcing',
            self::Interviews => 'Interviews',
            self::Closed => 'Closed',

        };
    }
}
