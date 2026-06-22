<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use InvalidArgumentException;

final readonly class UpdateAppointmentStatus
{
    /**
     * Mark a confirmed appointment as completed or no-show. Irreversible.
     *
     * @throws InvalidArgumentException
     */
    public function run(Appointment $appointment, AppointmentStatus $status): Appointment
    {
        throw_unless(in_array($status, [AppointmentStatus::Completed, AppointmentStatus::NoShow], true), InvalidArgumentException::class, 'Status must be completed or no_show.');

        throw_if($appointment->status !== AppointmentStatus::Confirmed, InvalidArgumentException::class, 'Only confirmed appointments can be updated.');

        $appointment->update(['status' => $status]);

        return $appointment->refresh();
    }
}
