<?php

declare(strict_types = 1);

use App\Actions\HoldSlot;
use App\Enums\AppointmentStatus;
use App\Exceptions\SlotUnavailableException;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Date;

function makeBarberAndService(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();
    $service = Service::factory()->for($profile, 'barberProfile')->create([
        'duration_minutes' => 30,
    ]);

    return [$profile, $service];
}

it('creates a pending appointment with locked_until 5 minutes in the future for a free slot', function (): void {
    [$profile, $service] = makeBarberAndService();

    $startsAt = Date::parse('2026-06-01 10:00:00');

    $appointment = resolve(HoldSlot::class)->run($profile, $service, $startsAt, 'John Doe', '(11) 99999-9999');

    expect($appointment)->toBeInstanceOf(Appointment::class)
        ->and($appointment->status)->toBe(AppointmentStatus::Pending)
        ->and($appointment->locked_until)->not->toBeNull()
        ->and($appointment->locked_until->greaterThan(now()))->toBeTrue()
        ->and($appointment->locked_until->lessThanOrEqualTo(now()->addMinutes(5)->addSeconds(5)))->toBeTrue();
});

it('throws SlotUnavailableException when an active pending lock exists for the same slot', function (): void {
    [$profile, $service] = makeBarberAndService();

    $startsAt = Date::parse('2026-06-01 10:00:00');
    $endsAt   = $startsAt->copy()->addMinutes(30);

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->pending()->create([
        'starts_at'    => $startsAt,
        'ends_at'      => $endsAt,
        'locked_until' => now()->addMinutes(5),
    ]);

    expect(fn () => resolve(HoldSlot::class)->run($profile, $service, $startsAt, 'Jane Doe', '(11) 88888-8888'))
        ->toThrow(SlotUnavailableException::class);
});

it('succeeds when the only existing appointment is an expired pending lock', function (): void {
    [$profile, $service] = makeBarberAndService();

    $startsAt = Date::parse('2026-06-01 10:00:00');
    $endsAt   = $startsAt->copy()->addMinutes(30);

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->expired()->create([
        'starts_at' => $startsAt,
        'ends_at'   => $endsAt,
    ]);

    $appointment = resolve(HoldSlot::class)->run($profile, $service, $startsAt, 'Bob Smith', '(11) 77777-7777');

    expect($appointment)->toBeInstanceOf(Appointment::class)
        ->and($appointment->status)->toBe(AppointmentStatus::Pending);
});

it('scopes active locks to non-expired pending appointments', function (): void {
    [$profile, $service] = makeBarberAndService();

    $active = Appointment::factory()->for($profile, 'barberProfile')->for($service)->pending()->create([
        'locked_until' => now()->addMinutes(5),
    ]);

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->expired()->create();
    Appointment::factory()->for($profile, 'barberProfile')->for($service)->confirmed()->create();

    $activeLocks = Appointment::query()->activeLocks()->pluck('id');

    expect($activeLocks)->toHaveCount(1)
        ->and($activeLocks->first())->toBe($active->id);
});

it('deletes expired pending slot locks via artisan command', function (): void {
    [$profile, $service] = makeBarberAndService();

    $expired = Appointment::factory()->for($profile, 'barberProfile')->for($service)->expired()->create();
    $active  = Appointment::factory()->for($profile, 'barberProfile')->for($service)->pending()->create([
        'locked_until' => now()->addMinutes(5),
    ]);

    $this->artisan('appointments:prune-locks')
        ->expectsOutput('Deleted 1 expired slot lock(s).')
        ->assertSuccessful();

    expect(Appointment::query()->find($expired->id))->toBeNull()
        ->and(Appointment::query()->find($active->id))->not->toBeNull();
});

it('throws SlotUnavailableException when a confirmed appointment occupies the slot', function (): void {
    [$profile, $service] = makeBarberAndService();

    $startsAt = Date::parse('2026-06-01 10:00:00');
    $endsAt   = $startsAt->copy()->addMinutes(30);

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->confirmed()->create([
        'starts_at' => $startsAt,
        'ends_at'   => $endsAt,
    ]);

    expect(fn () => resolve(HoldSlot::class)->run($profile, $service, $startsAt, 'Alice', '(11) 66666-6666'))
        ->toThrow(SlotUnavailableException::class);
});
