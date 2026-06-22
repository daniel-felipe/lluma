<?php

declare(strict_types = 1);

use App\Enums\AppointmentStatus;
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
function makeBookableBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create();
    $service = Service::factory()->for($profile, 'barberProfile')->create([
        'duration_minutes' => 30,
        'is_active'        => true,
    ]);

    $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(0)->create();

    // Every ISO day open 09:00–18:00
    foreach (range(1, 7) as $day) {
        BarberScheduleDay::factory()->forSchedule($schedule)->create([
            'day_of_week' => $day,
            'is_open'     => true,
            'opens_at'    => '09:00:00',
            'closes_at'   => '18:00:00',
        ]);
    }

    return [$profile, $service];
}

beforeEach(function (): void {
    Date::setTestNow(Date::parse('2026-06-10 08:00:00'));
});

// ─────────────────────────────────────────────────────────────
// Public barber page
// ─────────────────────────────────────────────────────────────

it('renders the public barber page for a published profile', function (): void {
    [$profile, $service] = makeBookableBarber();

    $this->get('/' . $profile->slug)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('booking/show')
            ->where('barber.slug', $profile->slug)
            ->where('barber.business_name', $profile->business_name)
            ->has('services', 1)
            ->where('services.0.id', $service->id));
});

it('returns 404 for a draft barber profile', function (): void {
    $profile = BarberProfile::factory()->for(User::factory())->create();

    $this->get('/' . $profile->slug)->assertNotFound();
});

it('returns 404 for an unknown slug', function (): void {
    $this->get('/unknown-barber')->assertNotFound();
});

it('does not list inactive services on the public page', function (): void {
    [$profile] = makeBookableBarber();

    Service::factory()->for($profile, 'barberProfile')->create(['is_active' => false]);

    $this->get('/' . $profile->slug)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('services', 1));
});

// ─────────────────────────────────────────────────────────────
// Booking creation
// ─────────────────────────────────────────────────────────────

it('creates a confirmed booking for a free slot', function (): void {
    [$profile, $service] = makeBookableBarber();

    $response = $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-11',
        'time'         => '10:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ]);

    $appointment = Appointment::query()->sole();

    $response->assertRedirect(route('bookings.show', $appointment));

    expect($appointment->status)->toBe(AppointmentStatus::Confirmed)
        ->and($appointment->locked_until)->toBeNull()
        ->and($appointment->client_name)->toBe('Rafael Souza')
        ->and($appointment->starts_at->format('Y-m-d H:i'))->toBe('2026-06-11 10:00')
        ->and($appointment->ends_at->format('H:i'))->toBe('10:30');
});

it('rejects a booking for an already booked slot', function (): void {
    [$profile, $service] = makeBookableBarber();

    Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-11 10:00:00',
        'ends_at'   => '2026-06-11 10:30:00',
    ]);

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-11',
        'time'         => '10:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertSessionHasErrors('time');

    expect(Appointment::query()->count())->toBe(1);
});

it('rejects a duplicate booking from the same phone at an overlapping time', function (): void {
    [$profile, $service] = makeBookableBarber();

    $otherService = Service::factory()->for($profile, 'barberProfile')->create([
        'duration_minutes' => 60,
        'is_active'        => true,
    ]);

    Appointment::factory()->for($profile)->for($otherService)->confirmed()->create([
        'starts_at'    => '2026-06-11 10:00:00',
        'ends_at'      => '2026-06-11 11:00:00',
        'client_phone' => '(11) 99999-1234',
    ]);

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-11',
        'time'         => '11:30',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertRedirect();

    // Overlapping attempt blocked by duplicate-phone rule (different slot would pass)
    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-11',
        'time'         => '11:45',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertSessionHasErrors('client_phone');
});

it('rejects a booking with a date outside the 14-day window', function (): void {
    [$profile, $service] = makeBookableBarber();

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-07-10',
        'time'         => '10:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertSessionHasErrors('date');
});

it('rejects a booking with a past time', function (): void {
    [$profile, $service] = makeBookableBarber();

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-10',
        'time'         => '07:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertSessionHasErrors('time');
});

it('rejects a booking for a service belonging to another barber', function (): void {
    [$profile] = makeBookableBarber();

    $otherService = Service::factory()
        ->for(BarberProfile::factory()->for(User::factory()), 'barberProfile')
        ->create(['is_active' => true]);

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $otherService->id,
        'date'         => '2026-06-11',
        'time'         => '10:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertSessionHasErrors('service_id');
});

// ─────────────────────────────────────────────────────────────
// Confirmation page
// ─────────────────────────────────────────────────────────────

it('shows the booking confirmation page', function (): void {
    [$profile, $service] = makeBookableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create();

    $this->get(route('bookings.show', $appointment))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('booking/confirmation')
            ->where('appointment.id', $appointment->id)
            ->where('appointment.barber.slug', $profile->slug));
});
