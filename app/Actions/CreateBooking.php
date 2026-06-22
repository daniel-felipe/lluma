<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\AppointmentStatus;
use App\Exceptions\DuplicateBookingException;
use App\Exceptions\SlotUnavailableException;
use App\Jobs\SendWhatsAppBookingConfirmation;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

final readonly class CreateBooking
{
    /**
     * Create a confirmed booking for a client, guarding against slot conflicts
     * and duplicate bookings from the same phone at overlapping times.
     *
     * @throws SlotUnavailableException
     * @throws DuplicateBookingException
     */
    public function run(
        BarberProfile $barberProfile,
        Service $service,
        CarbonInterface $startsAt,
        string $clientName,
        string $clientPhone,
    ): Appointment {
        $appointment = DB::transaction(function () use ($barberProfile, $service, $startsAt, $clientName, $clientPhone): Appointment {
            $endsAt = $startsAt->copy()->addMinutes($service->duration_minutes);

            $duplicate = Appointment::query()
                ->where('barber_profile_id', $barberProfile->id)
                ->where('client_phone', $clientPhone)
                ->where('starts_at', '<', $endsAt)
                ->where('ends_at', '>', $startsAt)
                ->confirmedOrPending()
                ->exists();

            throw_if($duplicate, DuplicateBookingException::class);

            $appointment = resolve(HoldSlot::class)->run($barberProfile, $service, $startsAt, $clientName, $clientPhone);

            $appointment->update([
                'status'       => AppointmentStatus::Confirmed,
                'locked_until' => null,
            ]);

            return $appointment->refresh();
        });

        dispatch(new SendWhatsAppBookingConfirmation($appointment));

        return $appointment;
    }
}
