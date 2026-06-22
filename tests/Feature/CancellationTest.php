<?php

declare(strict_types = 1);

use App\Actions\HoldSlot;
use App\Enums\AppointmentStatus;
use App\Enums\BarberOnboardingStep;
use App\Jobs\SendWhatsAppCancellationNotice;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Date;

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{User, BarberProfile, Service}
 */
function makeCancellableBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);
    $service = Service::factory()->for($profile, 'barberProfile')->create(['is_active' => true]);

    return [$user, $profile, $service];
}

beforeEach(function (): void {
    Date::setTestNow(Date::parse('2026-06-10 08:00:00'));
});

// ─────────────────────────────────────────────────────────────
// Client cancellation
// ─────────────────────────────────────────────────────────────

it('lets a client cancel an upcoming booking and releases the slot', function (): void {
    Bus::fake();

    [, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-11 10:00:00',
        'ends_at'   => '2026-06-11 10:30:00',
    ]);

    $this->post(route('bookings.cancel', $appointment))
        ->assertRedirect(route('bookings.show', $appointment));

    $appointment->refresh();

    expect($appointment->status)->toBe(AppointmentStatus::Cancelled)
        ->and($appointment->cancelled_by)->toBe('client')
        ->and($appointment->cancelled_late)->toBeFalse();

    Bus::assertDispatched(SendWhatsAppCancellationNotice::class);
});

it('flags a late client cancellation under 2 hours before', function (): void {
    Bus::fake();

    [, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 09:00:00',
        'ends_at'   => '2026-06-10 09:30:00',
    ]);

    $this->post(route('bookings.cancel', $appointment))->assertRedirect();

    expect($appointment->refresh()->cancelled_late)->toBeTrue();
});

it('redirects rescheduling cancellations to the barber page with service preselected', function (): void {
    Bus::fake();

    [, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-11 10:00:00',
        'ends_at'   => '2026-06-11 10:30:00',
    ]);

    $this->post(route('bookings.cancel', $appointment), ['reschedule' => true])
        ->assertRedirect(route('barbers.show', [
            'barberProfile' => $profile,
            'service'       => $service->id,
        ]));

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Cancelled);
});

it('does not cancel an already completed appointment', function (): void {
    [, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->completed()->create();

    $this->post(route('bookings.cancel', $appointment))->assertSessionHasErrors('appointment');

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Completed);
});

it('frees the slot for new bookings after cancellation', function (): void {
    Bus::fake();

    [, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-11 10:00:00',
        'ends_at'   => '2026-06-11 10:30:00',
    ]);

    $this->post(route('bookings.cancel', $appointment));

    // The same slot can now be held again
    $held = resolve(HoldSlot::class)->run(
        $profile,
        $service,
        Date::parse('2026-06-11 10:00:00'),
        'Novo Cliente',
        '(11) 98888-7777',
    );

    expect($held)->toBeInstanceOf(Appointment::class);
});

// ─────────────────────────────────────────────────────────────
// Barber cancellation
// ─────────────────────────────────────────────────────────────

it('lets the barber cancel an appointment with a reason', function (): void {
    Bus::fake();

    [$user, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 09:00:00',
        'ends_at'   => '2026-06-10 09:30:00',
    ]);

    $this->actingAs($user)
        ->post(route('appointments.cancel', $appointment), ['reason' => 'Imprevisto pessoal'])
        ->assertRedirect();

    $appointment->refresh();

    expect($appointment->status)->toBe(AppointmentStatus::Cancelled)
        ->and($appointment->cancelled_by)->toBe('barber')
        ->and($appointment->cancellation_reason)->toBe('Imprevisto pessoal')
        ->and($appointment->cancelled_late)->toBeFalse();

    Bus::assertDispatched(SendWhatsAppCancellationNotice::class);
});

it('rejects barber cancellation of a past appointment', function (): void {
    [$user, $profile, $service] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 07:00:00',
        'ends_at'   => '2026-06-10 07:30:00',
    ]);

    $this->actingAs($user)
        ->post(route('appointments.cancel', $appointment))
        ->assertSessionHasErrors('appointment');

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Confirmed);
});

it('forbids a barber from cancelling another barber appointment', function (): void {
    [$user]                          = makeCancellableBarber();
    [, $otherProfile, $otherService] = makeCancellableBarber();

    $appointment = Appointment::factory()->for($otherProfile)->for($otherService)->confirmed()->create();

    $this->actingAs($user)
        ->post(route('appointments.cancel', $appointment))
        ->assertForbidden();
});
