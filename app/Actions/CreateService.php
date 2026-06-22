<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\BarberProfile;
use App\Models\Service;

final readonly class CreateService
{
    public function run(
        BarberProfile $profile,
        string $name,
        int $priceCents,
        int $durationMinutes,
    ): Service {
        $sortOrder = ($profile->services()->max('sort_order') ?? 0) + 1;

        return $profile->services()->create([
            'name'             => $name,
            'price_cents'      => $priceCents,
            'duration_minutes' => $durationMinutes,
            'sort_order'       => $sortOrder,
        ]);
    }
}
