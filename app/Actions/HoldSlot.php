<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\AppointmentStatus;
use App\Exceptions\SlotUnavailableException;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final readonly class HoldSlot
{
    /**
     * Hold a slot by creating a pending appointment locked for 5 minutes.
     *
     * @throws SlotUnavailableException
     */
    public function run(
        BarberProfile $barberProfile,
        Service $service,
        CarbonInterface $startsAt,
        string $clientName,
        string $clientPhone,
    ): Appointment {
        return DB::transaction(function () use ($barberProfile, $service, $startsAt, $clientName, $clientPhone): Appointment {
            $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

            // Check for conflicting confirmed appointments or active pending locks
            $conflict = Appointment::query()
                ->where('barber_profile_id', $barberProfile->id)
                ->where(function (Builder $query) use ($startsAt, $endsAt): void {
                    $query->where('starts_at', '<', $endsAt)
                        ->where('ends_at', '>', $startsAt);
                })
                ->confirmedOrPending()
                ->exists();

            throw_if($conflict, SlotUnavailableException::class);

            return Appointment::query()->create([
                'barber_profile_id' => $barberProfile->id,
                'service_id'        => $service->id,
                'client_name'       => $clientName,
                'client_phone'      => $clientPhone,
                'starts_at'         => $startsAt,
                'ends_at'           => $endsAt,
                'status'            => AppointmentStatus::Pending,
                'locked_until'      => now()->addMinutes(5),
            ]);
        });
    }
}
