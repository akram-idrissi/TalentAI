<?php

namespace App\Enums;

enum GenderPref: string
{
    case Male = 'M';
    case Female = 'F';
    case Any = 'any';

    public function label(): string
    {
        return match ($this) {
            self::Male => 'Male',
            self::Female => 'Female',
            self::Any => 'Any',

        };
    }
}
