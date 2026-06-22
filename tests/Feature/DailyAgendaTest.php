<?php

declare(strict_types = 1);

use App\Enums\AppointmentStatus;
use App\Enums\BarberOnboardingStep;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Date;

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{User, BarberProfile, Service}
 */
function makeAgendaBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);
    $service = Service::factory()->for($profile, 'barberProfile')->create([
        'price_cents'      => 5000,
        'duration_minutes' => 30,
        'is_active'        => true,
    ]);

    return [$user, $profile, $service];
}

beforeEach(function (): void {
    Date::setTestNow(Date::parse('2026-06-10 12:00:00'));
});

// ─────────────────────────────────────────────────────────────
// Daily agenda view
// ─────────────────────────────────────────────────────────────

it('shows today appointments in chronological order with metrics', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $later = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 15:00:00',
        'ends_at'   => '2026-06-10 15:30:00',
    ]);
    $earlier = Appointment::factory()->for($profile)->for($service)->completed()->create([
        'starts_at' => '2026-06-10 09:00:00',
        'ends_at'   => '2026-06-10 09:30:00',
    ]);

    // Noise: tomorrow, cancelled, pending lock
    Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-11 09:00:00',
        'ends_at'   => '2026-06-11 09:30:00',
    ]);
    Appointment::factory()->for($profile)->for($service)->cancelled()->create([
        'starts_at' => '2026-06-10 10:00:00',
        'ends_at'   => '2026-06-10 10:30:00',
    ]);
    Appointment::factory()->for($profile)->for($service)->pending()->create([
        'starts_at' => '2026-06-10 11:00:00',
        'ends_at'   => '2026-06-10 11:30:00',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('agenda/daily')
            ->has('appointments', 2)
            ->where('appointments.0.id', $earlier->id)
            ->where('appointments.1.id', $later->id)
            ->where('metrics.total_booked', 2)
            ->where('metrics.completed', 1)
            ->where('metrics.completed_revenue_cents', 5000));
});

// ─────────────────────────────────────────────────────────────
// Status updates
// ─────────────────────────────────────────────────────────────

it('marks a confirmed appointment as completed', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create();

    $this->actingAs($user)
        ->patch(route('appointments.status', $appointment), ['status' => 'completed'])
        ->assertRedirect();

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Completed);
});

it('marks a confirmed appointment as no-show', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create();

    $this->actingAs($user)
        ->patch(route('appointments.status', $appointment), ['status' => 'no_show'])
        ->assertRedirect();

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::NoShow);
});

it('does not allow updating a completed appointment again', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->completed()->create();

    $this->actingAs($user)
        ->patch(route('appointments.status', $appointment), ['status' => 'no_show'])
        ->assertSessionHasErrors('status');

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Completed);
});

it('rejects invalid statuses', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create();

    $this->actingAs($user)
        ->patch(route('appointments.status', $appointment), ['status' => 'cancelled'])
        ->assertSessionHasErrors('status');
});

it('forbids updating another barber appointment', function (): void {
    [$user]                          = makeAgendaBarber();
    [, $otherProfile, $otherService] = makeAgendaBarber();

    $appointment = Appointment::factory()->for($otherProfile)->for($otherService)->confirmed()->create();

    $this->actingAs($user)
        ->patch(route('appointments.status', $appointment), ['status' => 'completed'])
        ->assertForbidden();
});

// ─────────────────────────────────────────────────────────────
// Walk-in
// ─────────────────────────────────────────────────────────────

it('registers a walk-in as a confirmed appointment', function (): void {
    [$user, $profile, $service] = makeAgendaBarber();

    $this->actingAs($user)
        ->post(route('appointments.walk-in'), [
            'service_id'  => $service->id,
            'date'        => '2026-06-10',
            'time'        => '12:00',
            'client_name' => 'Cliente Encaixe',
        ])
        ->assertRedirect();

    $appointment = Appointment::query()->sole();

    expect($appointment->status)->toBe(AppointmentStatus::Confirmed)
        ->and($appointment->client_name)->toBe('Cliente Encaixe')
        ->and($appointment->ends_at->format('H:i'))->toBe('12:30');
});

it('rejects a walk-in with a service from another barber', function (): void {
    [$user]             = makeAgendaBarber();
    [, , $otherService] = makeAgendaBarber();

    $this->actingAs($user)
        ->post(route('appointments.walk-in'), [
            'service_id'  => $otherService->id,
            'date'        => '2026-06-10',
            'time'        => '12:00',
            'client_name' => 'Cliente Encaixe',
        ])
        ->assertSessionHasErrors('service_id');
});
