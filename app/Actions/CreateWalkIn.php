<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use Carbon\CarbonInterface;

final readonly class CreateWalkIn
{
    /**
     * Register a walk-in client as a confirmed appointment (may be retroactive,
     * used for revenue tracking — no slot conflict check on purpose).
     */
    public function run(
        BarberProfile $barberProfile,
        Service $service,
        CarbonInterface $startsAt,
        string $clientName,
        string $clientPhone = '',
    ): Appointment {
        return Appointment::query()->create([
            'barber_profile_id' => $barberProfile->id,
            'service_id'        => $service->id,
            'client_name'       => $clientName,
            'client_phone'      => $clientPhone,
            'starts_at'         => $startsAt,
            'ends_at'           => $startsAt->copy()->addMinutes($service->duration_minutes),
            'status'            => AppointmentStatus::Confirmed,
        ]);
    }
}
