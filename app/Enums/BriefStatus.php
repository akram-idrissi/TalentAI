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

    /**
     * Return all cases as [{value, label}] — ready for Inertia page props.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function toSelectArray(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
