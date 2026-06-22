<?php

declare(strict_types = 1);

use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Date;

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{BarberProfile, Service}
 */
function makeFullBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create();
    $service = Service::factory()->for($profile, 'barberProfile')->create([
        'duration_minutes' => 30,
        'is_active'        => true,
    ]);

    $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(0)->create();

    // Monday (ISO day 1) open 09:00–11:00
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week' => 1,
        'is_open'     => true,
        'opens_at'    => '09:00:00',
        'closes_at'   => '11:00:00',
    ]);

    return [$profile, $service];
}

/** Returns next Monday within the 14-day window */
function nextMonday(): string
{
    return Date::now()->next('Monday')->format('Y-m-d');
}

/** Returns next Tuesday within the 14-day window */
function nextTuesday(): string
{
    return Date::now()->next('Tuesday')->format('Y-m-d');
}

// ─────────────────────────────────────────────────────────────
// Happy path
// ─────────────────────────────────────────────────────────────

it('returns 200 with slots for a configured barber on a workday', function (): void {
    [$profile, $service] = makeFullBarber();
    $monday              = nextMonday();

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk()
        ->assertJsonStructure(['slots'])
        ->assertJsonPath('slots.0', '09:00');
});

it('unauthenticated requests succeed (no auth required)', function (): void {
    [$profile, $service] = makeFullBarber();
    $monday              = nextMonday();

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk();
});

// ─────────────────────────────────────────────────────────────
// Confirmed booking filtering
// ─────────────────────────────────────────────────────────────

it('excludes the 09:00 slot when a confirmed booking exists at 09:00', function (): void {
    [$profile, $service] = makeFullBarber();
    $monday              = nextMonday();

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->confirmed()->create([
        'starts_at' => $monday . ' 09:00:00',
        'ends_at'   => $monday . ' 09:30:00',
    ]);

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk();

    $slots = $response->json('slots');

    expect($slots)->not->toContain('09:00');
});

// ─────────────────────────────────────────────────────────────
// Active pending lock filtering
// ─────────────────────────────────────────────────────────────

it('excludes a slot when an active pending lock occupies it', function (): void {
    [$profile, $service] = makeFullBarber();
    $monday              = nextMonday();

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->pending()->create([
        'starts_at'    => $monday . ' 09:00:00',
        'ends_at'      => $monday . ' 09:30:00',
        'locked_until' => now()->addMinutes(5),
    ]);

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk();

    $slots = $response->json('slots');

    expect($slots)->not->toContain('09:00');
});

// ─────────────────────────────────────────────────────────────
// Expired pending lock is transparent
// ─────────────────────────────────────────────────────────────

it('includes a slot when the pending lock is expired', function (): void {
    [$profile, $service] = makeFullBarber();
    $monday              = nextMonday();

    Appointment::factory()->for($profile, 'barberProfile')->for($service)->expired()->create([
        'starts_at'    => $monday . ' 09:00:00',
        'ends_at'      => $monday . ' 09:30:00',
        'locked_until' => now()->subMinutes(10),
    ]);

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk();

    $slots = $response->json('slots');

    expect($slots)->toContain('09:00');
});

// ─────────────────────────────────────────────────────────────
// Validation errors
// ─────────────────────────────────────────────────────────────

it('returns 422 when date is more than 14 days in the future', function (): void {
    [$profile, $service] = makeFullBarber();

    $date = now()->addDays(15)->format('Y-m-d');

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $date));

    $response->assertUnprocessable();
});

it('returns 422 when date is in the past', function (): void {
    [$profile, $service] = makeFullBarber();

    $date = now()->subDay()->format('Y-m-d');

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $date));

    $response->assertUnprocessable();
});

it('returns 404 for an unknown barber slug', function (): void {
    [, $service] = makeFullBarber();
    $monday      = nextMonday();

    $response = $this->getJson(route('barbers.slots', ['barberProfile' => 'nonexistent-slug']) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertNotFound();
});

it('returns 422 when service does not belong to the barber', function (): void {
    [$profile] = makeFullBarber();
    $monday    = nextMonday();

    $otherUser    = User::factory()->create();
    $otherProfile = BarberProfile::factory()->for($otherUser)->published()->create();
    $otherService = Service::factory()->for($otherProfile, 'barberProfile')->create(['is_active' => true]);

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $otherService->id, $monday));

    $response->assertUnprocessable();
});

// ─────────────────────────────────────────────────────────────
// Edge cases
// ─────────────────────────────────────────────────────────────

it('returns 200 with empty slots when barber has no schedule', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create();
    $service = Service::factory()->for($profile, 'barberProfile')->create(['is_active' => true]);
    $monday  = nextMonday();

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $monday));

    $response->assertOk()
        ->assertExactJson(['slots' => []]);
});

it('returns 200 with empty slots for a day the barber does not work', function (): void {
    [$profile, $service] = makeFullBarber();

    $tuesday = nextTuesday();

    $response = $this->getJson(route('barbers.slots', $profile) . sprintf('?service_id=%s&date=%s', $service->id, $tuesday));

    $response->assertOk()
        ->assertExactJson(['slots' => []]);
});
