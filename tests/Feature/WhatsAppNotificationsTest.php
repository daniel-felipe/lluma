<?php

declare(strict_types = 1);

use App\Jobs\SendWhatsAppBookingConfirmation;
use App\Jobs\SendWhatsAppBookingReminder;
use App\Jobs\SendWhatsAppCancellationNotice;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\Service;
use App\Models\User;
use App\Services\LogWhatsAppGateway;
use App\Services\NullWhatsAppGateway;
use App\Services\WhatsAppMessageComposer;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Log;

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{BarberProfile, Service}
 */
function makeNotifiableBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create();
    $service = Service::factory()->for($profile, 'barberProfile')->create([
        'duration_minutes' => 30,
        'is_active'        => true,
    ]);

    $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(0)->create();

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
    NullWhatsAppGateway::$sent = [];
});

// ─────────────────────────────────────────────────────────────
// Confirmation
// ─────────────────────────────────────────────────────────────

it('queues a WhatsApp confirmation when a booking is created', function (): void {
    Bus::fake();

    [$profile, $service] = makeNotifiableBarber();

    $this->post('/barbers/' . $profile->slug . '/bookings', [
        'service_id'   => $service->id,
        'date'         => '2026-06-11',
        'time'         => '10:00',
        'client_name'  => 'Rafael Souza',
        'client_phone' => '(11) 99999-1234',
    ])->assertRedirect();

    Bus::assertDispatched(SendWhatsAppBookingConfirmation::class);
});

it('skips confirmation when client phone is empty', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'client_phone' => '',
    ]);

    new SendWhatsAppBookingConfirmation($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toBeEmpty();
});

it('sends the confirmation message through the gateway', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'client_name'  => 'Rafael',
        'client_phone' => '(11) 99999-1234',
        'starts_at'    => '2026-06-11 10:00:00',
        'ends_at'      => '2026-06-11 10:30:00',
    ]);

    new SendWhatsAppBookingConfirmation($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toHaveCount(1)
        ->and(NullWhatsAppGateway::$sent[0]['phone'])->toBe('(11) 99999-1234')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('Rafael')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('11/06/2026')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('10:00')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain($service->name);
});

// ─────────────────────────────────────────────────────────────
// Reminders
// ─────────────────────────────────────────────────────────────

it('queues reminders only for confirmed appointments within the next hour', function (): void {
    Bus::fake();

    [$profile, $service] = makeNotifiableBarber();

    $soon = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 08:45:00',
        'ends_at'   => '2026-06-10 09:15:00',
    ]);

    // Too far in the future
    Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-10 10:00:00',
        'ends_at'   => '2026-06-10 10:30:00',
    ]);

    // Already reminded
    Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at'        => '2026-06-10 08:30:00',
        'ends_at'          => '2026-06-10 09:00:00',
        'reminder_sent_at' => '2026-06-10 07:30:00',
    ]);

    // Cancelled
    Appointment::factory()->for($profile)->for($service)->cancelled()->create([
        'starts_at' => '2026-06-10 08:50:00',
        'ends_at'   => '2026-06-10 09:20:00',
    ]);

    $this->artisan('appointments:send-reminders')->assertSuccessful();

    Bus::assertDispatchedTimes(SendWhatsAppBookingReminder::class, 1);
    Bus::assertDispatched(
        SendWhatsAppBookingReminder::class,
        fn (SendWhatsAppBookingReminder $job): bool => $job->appointment->is($soon),
    );

    expect($soon->refresh()->reminder_sent_at)->not->toBeNull();
});

it('does not send a reminder for an appointment cancelled after queueing', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->cancelled()->create();

    new SendWhatsAppBookingReminder($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toBeEmpty();
});

it('sends the reminder message through the gateway', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'client_phone' => '(11) 99999-1234',
        'starts_at'    => '2026-06-10 09:00:00',
        'ends_at'      => '2026-06-10 09:30:00',
    ]);

    new SendWhatsAppBookingReminder($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toHaveCount(1)
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain($service->name)
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('09:00')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain($profile->business_name);
});

it('skips reminder when client phone is empty', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'client_phone' => '',
    ]);

    new SendWhatsAppBookingReminder($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toBeEmpty();
});

// ─────────────────────────────────────────────────────────────
// Cancellation notice
// ─────────────────────────────────────────────────────────────

it('sends the cancellation message through the gateway', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->cancelled()->create([
        'client_name'  => 'Rafael',
        'client_phone' => '(11) 99999-1234',
        'starts_at'    => '2026-06-11 10:00:00',
        'ends_at'      => '2026-06-11 10:30:00',
    ]);

    new SendWhatsAppCancellationNotice($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toHaveCount(1)
        ->and(NullWhatsAppGateway::$sent[0]['phone'])->toBe('(11) 99999-1234')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('Rafael')
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain($service->name)
        ->and(NullWhatsAppGateway::$sent[0]['message'])->toContain('11/06/2026');
});

it('skips cancellation notice when client phone is empty', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->cancelled()->create([
        'client_phone' => '',
    ]);

    new SendWhatsAppCancellationNotice($appointment)->handle(
        new NullWhatsAppGateway(),
        resolve(WhatsAppMessageComposer::class),
    );

    expect(NullWhatsAppGateway::$sent)->toBeEmpty();
});

// ─────────────────────────────────────────────────────────────
// Message composer & stub gateway
// ─────────────────────────────────────────────────────────────

it('composes reminder and cancellation messages', function (): void {
    [$profile, $service] = makeNotifiableBarber();

    $appointment = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'client_name'  => 'Rafael',
        'client_phone' => '(11) 99999-1234',
        'starts_at'    => '2026-06-11 10:00:00',
        'ends_at'      => '2026-06-11 10:30:00',
    ]);

    $composer = resolve(WhatsAppMessageComposer::class);

    expect($composer->reminder($appointment))->toContain('Lembrete')
        ->and($composer->reminder($appointment))->toContain('10:00')
        ->and($composer->cancellation($appointment))->toContain('cancelado')
        ->and($composer->cancellation($appointment))->toContain('Rafael');
});

it('logs outgoing messages via the stub gateway', function (): void {
    Log::shouldReceive('info')
        ->once()
        ->with('WhatsApp message (stub gateway)', [
            'phone'   => '(11) 99999-1234',
            'message' => 'Test message',
        ]);

    new LogWhatsAppGateway()->send('(11) 99999-1234', 'Test message');
});
