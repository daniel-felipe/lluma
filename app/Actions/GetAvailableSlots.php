<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\Appointment;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\ValueObjects\AvailabilitySlot;
use DateTimeImmutable;
use Illuminate\Support\Collection;

final readonly class GetAvailableSlots
{
    /**
     * Generate available appointment slots for a given date.
     *
     * @param  Collection<int, Appointment>|array<int, Appointment>  $existingAppointments
     * @return array<int, AvailabilitySlot>
     */
    public function run(
        BarberSchedule $schedule,
        int $serviceDurationMinutes,
        DateTimeImmutable $date,
        Collection | array $existingAppointments = [],
    ): array {
        $dayOfWeek = (int) $date->format('N'); // ISO 8601: 1=Mon, 7=Sun
        /** @var BarberScheduleDay|null $day */
        $day = $schedule->days()->where('day_of_week', $dayOfWeek)->first();

        if ($day === null || ! $day->is_open || $day->opens_at === null || $day->closes_at === null) {
            return [];
        }

        $dateStr  = $date->format('Y-m-d');
        $cursor   = new DateTimeImmutable($dateStr . ' ' . $day->opens_at);
        $endOfDay = new DateTimeImmutable($dateStr . ' ' . $day->closes_at);

        $breakStart = $day->break_starts_at !== null
            ? new DateTimeImmutable($dateStr . ' ' . $day->break_starts_at)
            : null;

        $breakEnd = $day->break_ends_at !== null
            ? new DateTimeImmutable($dateStr . ' ' . $day->break_ends_at)
            : null;

        $slots = [];

        while (true) {
            $slotEnd = $cursor->modify('+' . $serviceDurationMinutes . ' minutes');

            if ($slotEnd > $endOfDay) {
                break;
            }

            if ($breakStart instanceof DateTimeImmutable && $breakEnd instanceof DateTimeImmutable && ($cursor < $breakEnd && $slotEnd > $breakStart)) {
                $cursor = $breakEnd;

                continue;
            }

            if ($this->conflictsWithExistingAppointments($cursor, $slotEnd, $schedule->buffer_minutes, $existingAppointments)) {
                $cursor = $cursor->modify('+' . $serviceDurationMinutes . ' minutes');

                continue;
            }

            $slots[] = new AvailabilitySlot($cursor, $slotEnd);

            $cursor = $cursor->modify('+' . ($serviceDurationMinutes + $schedule->buffer_minutes) . ' minutes');
        }

        return $slots;
    }

    /**
     * Check if a candidate slot conflicts with any existing appointment.
     *
     * A conflict exists when the candidate slot's time range overlaps with an existing appointment
     * plus its trailing buffer (buffer_minutes after the appointment ends).
     *
     * @param  Collection<int, Appointment>|array<int, Appointment>  $existingAppointments
     */
    private function conflictsWithExistingAppointments(
        DateTimeImmutable $slotStart,
        DateTimeImmutable $slotEnd,
        int $bufferMinutes,
        Collection | array $existingAppointments,
    ): bool {
        foreach ($existingAppointments as $appointment) {
            $apptStart = new DateTimeImmutable($appointment->starts_at->toDateTimeString());
            $apptEnd   = new DateTimeImmutable($appointment->ends_at->toDateTimeString());

            // The blocked window ends at apptEnd + buffer
            $blockedUntil = $apptEnd->modify('+' . $bufferMinutes . ' minutes');

            // Overlap: slot starts before blocked window ends AND slot ends after appointment starts
            if ($slotStart < $blockedUntil && $slotEnd > $apptStart) {
                return true;
            }
        }

        return false;
    }
}
