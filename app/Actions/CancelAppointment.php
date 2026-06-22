<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\AppointmentStatus;
use App\Jobs\SendWhatsAppCancellationNotice;
use App\Models\Appointment;
use InvalidArgumentException;

final readonly class CancelAppointment
{
    /**
     * Cancel a pending/confirmed appointment, releasing the slot immediately.
     *
     * Client cancellations under 2 hours before the appointment are allowed but
     * flagged as late (visible in client history to spot unreliable clients).
     *
     * @param  'client'|'barber'  $cancelledBy
     *
     * @throws InvalidArgumentException
     */
    public function run(Appointment $appointment, string $cancelledBy, ?string $reason = null): Appointment
    {
        throw_unless(in_array($appointment->status, [AppointmentStatus::Pending, AppointmentStatus::Confirmed], true), InvalidArgumentException::class, 'Only upcoming appointments can be cancelled.');

        throw_if($appointment->starts_at->isPast(), InvalidArgumentException::class, 'Past appointments cannot be cancelled.');

        $isLate = $cancelledBy === 'client' && now()->diffInMinutes($appointment->starts_at, false) < 120;

        $appointment->update([
            'status'              => AppointmentStatus::Cancelled,
            'cancelled_by'        => $cancelledBy,
            'cancellation_reason' => $reason,
            'cancelled_late'      => $isLate,
        ]);

        dispatch(new SendWhatsAppCancellationNotice($appointment));

        return $appointment->refresh();
    }
}
