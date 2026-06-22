<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Exceptions\ServiceException;
use App\Models\Service;

final readonly class ToggleService
{
    public function run(Service $service): Service
    {
        if ($service->is_active) {
            $profile = $service->barberProfile;
            throw_if($profile->services()->where('is_active', true)->count() <= 1, ServiceException::class, 'Um barbeiro deve ter pelo menos um serviço ativo.');
        }

        $service->update(['is_active' => ! $service->is_active]);

        return $service;
    }
}
