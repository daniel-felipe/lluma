<?php

declare(strict_types = 1);

use App\Actions\GetAvailableSlots;
use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\User;
use App\ValueObjects\AvailabilitySlot;
use Illuminate\Support\Facades\Date;

// ─────────────────────────────────────────────────────────────
// Closed / missing day
// ─────────────────────────────────────────────────────────────

it('returns empty array when day entry does not exist', function (): void {
    $schedule = makeSchedule();
    // No days created for this schedule
    $date = new DateTimeImmutable('2026-05-04'); // Monday

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toBeEmpty();
});

it('returns empty array when day is closed', function (): void {
    $schedule = makeSchedule();
    BarberScheduleDay::factory()->forSchedule($schedule)->closed()->create([
        'day_of_week' => 1,
    ]);

    $date  = new DateTimeImmutable('2026-05-04'); // Monday
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toBeEmpty();
});

it('returns empty array when day has no opens_at', function (): void {
    $schedule = makeSchedule();
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => null,
        'closes_at'   => '18:00:00',
    ]);

    $date  = new DateTimeImmutable('2026-05-04'); // Monday
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toBeEmpty();
});

// ─────────────────────────────────────────────────────────────
// Basic slot generation
// ─────────────────────────────────────────────────────────────

it('returns one slot when service exactly fills the day window', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '10:00:00',
    ]);

    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toHaveCount(1);
    expect($slots[0])->toBeInstanceOf(AvailabilitySlot::class);
    expect($slots[0]->startsAt->format('H:i'))->toBe('09:00');
    expect($slots[0]->endsAt->format('H:i'))->toBe('10:00');
});

it('returns correct slots for a standard day without buffer', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '11:00:00',
    ]);

    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toHaveCount(2);
    expect($slots[0]->startsAt->format('H:i'))->toBe('09:00');
    expect($slots[1]->startsAt->format('H:i'))->toBe('10:00');
});

it('applies buffer between slots', function (): void {
    $schedule = makeSchedule(bufferMinutes: 15);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '11:00:00',
    ]);

    // With 45-min service + 15-min buffer = 60-min step; two slots fit: 09:00 and 10:00
    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 45, $date);

    expect($slots)->toHaveCount(2);
    expect($slots[0]->startsAt->format('H:i'))->toBe('09:00');
    expect($slots[1]->startsAt->format('H:i'))->toBe('10:00');
});

it('does not return slot that would end after closing time', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '10:30:00',
    ]);

    // 60-min service: only 09:00–10:00 fits; 10:00–11:00 would exceed 10:30
    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    expect($slots)->toHaveCount(1);
    expect($slots[0]->startsAt->format('H:i'))->toBe('09:00');
});

// ─────────────────────────────────────────────────────────────
// Break block
// ─────────────────────────────────────────────────────────────

it('skips slots that overlap with break', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week'     => 1,
        'is_open'         => true,
        'opens_at'        => '09:00:00',
        'closes_at'       => '13:00:00',
        'break_starts_at' => '12:00:00',
        'break_ends_at'   => '12:30:00',
    ]);

    // 60-min service: 09:00, 10:00, 11:00 fit; 11:30 would overlap break (starts before 12:00 but ends at 12:30) — actually 11:30–12:30 overlaps
    // 12:30 fits (12:30–13:30 > 13:00 doesn't fit); so only 09:00, 10:00, 11:00
    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);
    expect($startTimes)->toBe(['09:00', '10:00', '11:00']);
});

it('resumes slots after break ends', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week'     => 1,
        'is_open'         => true,
        'opens_at'        => '09:00:00',
        'closes_at'       => '14:00:00',
        'break_starts_at' => '12:00:00',
        'break_ends_at'   => '13:00:00',
    ]);

    // 60-min service: 09:00, 10:00, 11:00, then break; resumes at 13:00 → 13:00–14:00
    $date  = new DateTimeImmutable('2026-05-04');
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 60, $date);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);
    expect($startTimes)->toBe(['09:00', '10:00', '11:00', '13:00']);
});

it('uses correct day of week via ISO 8601 format', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    // Only Wednesday (ISO 3) is open
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 3,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '10:00:00',
    ]);

    $wednesday = new DateTimeImmutable('2026-05-06'); // known Wednesday
    $monday    = new DateTimeImmutable('2026-05-04'); // known Monday

    $wedSlots = resolve(GetAvailableSlots::class)->run($schedule, 60, $wednesday);
    $monSlots = resolve(GetAvailableSlots::class)->run($schedule, 60, $monday);

    expect($wedSlots)->toHaveCount(1);
    expect($monSlots)->toBeEmpty();
});

// ─────────────────────────────────────────────────────────────
// Conflict detection — existing appointments
// ─────────────────────────────────────────────────────────────

it('excludes slots that overlap a confirmed booking', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '12:00:00',
    ]);

    $date    = new DateTimeImmutable('2026-05-04');
    $booking = makeAppointment('2026-05-04 10:00:00', '2026-05-04 10:30:00');

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$booking]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->toContain('09:00')
        ->and($startTimes)->not->toContain('10:00')
        ->and($startTimes)->toContain('10:30');
});

it('applies buffer after a confirmed booking', function (): void {
    $schedule = makeSchedule(bufferMinutes: 15);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '12:00:00',
    ]);

    $date    = new DateTimeImmutable('2026-05-04');
    $booking = makeAppointment('2026-05-04 10:00:00', '2026-05-04 10:30:00');

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$booking]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    // Blocked until 10:30 + 15 min buffer = 10:45
    expect($startTimes)->not->toContain('10:00')
        ->and($startTimes)->not->toContain('10:15')
        ->and($startTimes)->not->toContain('10:30')
        ->and($startTimes)->toContain('10:45');
});

it('allows a slot to start exactly when a booking ends with buffer 0', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '12:00:00',
    ]);

    $date    = new DateTimeImmutable('2026-05-04');
    $booking = makeAppointment('2026-05-04 09:00:00', '2026-05-04 09:30:00');

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$booking]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->not->toContain('09:00')
        ->and($startTimes)->toContain('09:30');
});

it('excludes a slot covered by an active pending lock', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '12:00:00',
    ]);

    $date = new DateTimeImmutable('2026-05-04');
    $lock = makeAppointment(
        '2026-05-04 10:00:00',
        '2026-05-04 10:30:00',
        AppointmentStatus::Pending,
        now()->addMinutes(5)->toDateTimeString()
    );

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$lock]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->not->toContain('10:00');
});

it('includes a slot when the pending lock is expired (not passed to action)', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '12:00:00',
    ]);

    $date = new DateTimeImmutable('2026-05-04');

    // Caller filters expired locks before calling GetAvailableSlots; pass empty list
    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, []);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->toContain('10:00');
});

it('handles two back-to-back bookings with no buffer and no slots between them', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '11:00:00',
    ]);

    $date     = new DateTimeImmutable('2026-05-04');
    $booking1 = makeAppointment('2026-05-04 09:00:00', '2026-05-04 09:30:00');
    $booking2 = makeAppointment('2026-05-04 09:30:00', '2026-05-04 10:00:00');

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$booking1, $booking2]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->not->toContain('09:00')
        ->and($startTimes)->not->toContain('09:30')
        ->and($startTimes)->toContain('10:00');
});

it('handles a booking spanning the break block without infinite loop', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week'     => 1,
        'is_open'         => true,
        'opens_at'        => '09:00:00',
        'closes_at'       => '17:00:00',
        'break_starts_at' => '12:00:00',
        'break_ends_at'   => '13:00:00',
    ]);

    $date    = new DateTimeImmutable('2026-05-04');
    $booking = makeAppointment('2026-05-04 11:30:00', '2026-05-04 12:30:00');

    $slots = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, [$booking]);

    $startTimes = array_map(fn (AvailabilitySlot $s): string => $s->startsAt->format('H:i'), $slots);

    expect($startTimes)->not->toContain('11:30')
        ->and($startTimes)->toContain('11:00')
        ->and($startTimes)->toContain('13:00');
});

it('output is identical to base behavior when no appointments are provided', function (): void {
    $schedule = makeSchedule(bufferMinutes: 0);
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '10:00:00',
    ]);

    $date     = new DateTimeImmutable('2026-05-04');
    $withNone = resolve(GetAvailableSlots::class)->run($schedule, 30, $date, []);
    $default  = resolve(GetAvailableSlots::class)->run($schedule, 30, $date);

    expect(count($withNone))->toBe(count($default));
});

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function makeSchedule(int $bufferMinutes = 0): BarberSchedule
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();

    return BarberSchedule::factory()
        ->forProfile($profile)
        ->withBuffer($bufferMinutes)
        ->create();
}

function makeAppointment(string $startsAt, string $endsAt, AppointmentStatus $status = AppointmentStatus::Confirmed, ?string $lockedUntil = null): Appointment
{
    $appointment               = new Appointment();
    $appointment->starts_at    = Date::parse($startsAt);
    $appointment->ends_at      = Date::parse($endsAt);
    $appointment->status       = $status;
    $appointment->locked_until = $lockedUntil !== null ? Date::parse($lockedUntil) : null;

    return $appointment;
}
