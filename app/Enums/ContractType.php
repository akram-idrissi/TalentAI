<?php

namespace App\Enums;

enum ContractType: string
{
    case CDI = 'CDI';
    case CDD = 'CDD';
    case Freelance = 'Freelance';
    case Stage = 'Stage';

    public function label(): string
    {
        return match ($this) {
            self::CDI => 'CDI',
            self::CDD => 'CDD',
            self::Freelance => 'Freelance',
            self::Stage => 'Stage',
        };
    }
}
