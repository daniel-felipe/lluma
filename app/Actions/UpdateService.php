<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\Service;

final readonly class UpdateService
{
    public function run(
        Service $service,
        string $name,
        int $priceCents,
        int $durationMinutes,
    ): Service {
        $service->update([
            'name'             => $name,
            'price_cents'      => $priceCents,
            'duration_minutes' => $durationMinutes,
        ]);

        return $service;
    }
}
