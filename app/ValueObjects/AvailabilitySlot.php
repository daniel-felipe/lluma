<?php

declare(strict_types = 1);

namespace App\ValueObjects;

use DateTimeImmutable;

final readonly class AvailabilitySlot
{
    public function __construct(
        public DateTimeImmutable $startsAt,
        public DateTimeImmutable $endsAt,
    ) {}
}
