<?php

declare(strict_types = 1);

namespace App\Actions;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

final readonly class CancelServiceAppointments
{
    /**
     * @return Collection<int, Model>
     */
    public function run(): Collection
    {
        // F4 — conectar ao model Appointment quando disponível
        return new Collection();
    }
}
