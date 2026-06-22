<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\User;

// ─────────────────────────────────────────────────────────────
// show
// ─────────────────────────────────────────────────────────────

it('renders availability page with correct Inertia component', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.availability.show'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/availability')
            ->has('schedule')
            ->has('schedule.buffer_minutes')
            ->has('schedule.days')
            ->has('is_onboarding')
            ->has('onboarding_step')
            ->has('steps'));
});

it('returns default schedule when barber has no schedule', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.availability.show'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/availability')
            ->where('schedule.buffer_minutes', 0)
            ->count('schedule.days', 7)
            ->where('schedule.days.0.day_of_week', 1)
            ->where('schedule.days.0.is_open', true)
            ->where('schedule.days.0.opens_at', '09:00')
            ->where('schedule.days.0.closes_at', '19:00')
            ->where('schedule.days.5.day_of_week', 6)
            ->where('schedule.days.5.is_open', true)
            ->where('schedule.days.5.opens_at', '08:00')
            ->where('schedule.days.5.closes_at', '17:00')
            ->where('schedule.days.6.day_of_week', 7)
            ->where('schedule.days.6.is_open', false));
});

it('returns existing schedule with times as HH:MM', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);
    $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(15)->create();
    BarberScheduleDay::factory()->forSchedule($schedule)->create([
        'day_of_week'     => 1,
        'is_open'         => true,
        'opens_at'        => '08:30:00',
        'closes_at'       => '17:00:00',
        'break_starts_at' => '12:00:00',
        'break_ends_at'   => '13:00:00',
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.availability.show'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/availability')
            ->where('schedule.buffer_minutes', 15)
            ->where('schedule.days.0.day_of_week', 1)
            ->where('schedule.days.0.opens_at', '08:30')
            ->where('schedule.days.0.closes_at', '17:00')
            ->where('schedule.days.0.break_starts_at', '12:00')
            ->where('schedule.days.0.break_ends_at', '13:00'));
});

it('returns days ordered by day_of_week', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);
    $schedule = BarberSchedule::factory()->forProfile($profile)->create();

    // Insert days in reverse order
    foreach ([7, 3, 1, 5] as $dow) {
        BarberScheduleDay::factory()->forSchedule($schedule)->create(['day_of_week' => $dow]);
    }

    $response = $this->actingAs($user)->get(route('onboarding.availability.show'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('schedule.days.0.day_of_week', 1)
            ->where('schedule.days.1.day_of_week', 3)
            ->where('schedule.days.2.day_of_week', 5)
            ->where('schedule.days.3.day_of_week', 7));
});

it('redirects unauthenticated request to login', function (): void {
    $response = $this->get(route('onboarding.availability.show'));

    $response->assertRedirectToRoute('login');
});

// ─────────────────────────────────────────────────────────────
// update
// ─────────────────────────────────────────────────────────────

it('saves schedule and redirects to dashboard when completing onboarding', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $response = $this->actingAs($user)->put(
        route('onboarding.availability.update'),
        validSchedulePayload(),
    );

    $response->assertRedirectToRoute('dashboard');
    expect(BarberSchedule::query()->count())->toBe(1)
        ->and(BarberScheduleDay::query()->count())->toBe(7);
});

it('saves schedule and redirects back to availability page when already Complete', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);

    $response = $this->actingAs($user)->put(
        route('onboarding.availability.update'),
        validSchedulePayload(),
    );

    $response->assertRedirectToRoute('onboarding.availability.show');
});

it('persists buffer_minutes correctly', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                   = validSchedulePayload();
    $payload['buffer_minutes'] = 15;

    $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    expect($profile->schedule->buffer_minutes)->toBe(15);
});

it('stores times as HH:MM:SS in database', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $this->actingAs($user)->put(route('onboarding.availability.update'), validSchedulePayload());

    $day = $profile->schedule->days()->where('day_of_week', 1)->first();
    expect($day->opens_at)->toBe('09:00:00')
        ->and($day->closes_at)->toBe('18:00:00');
});

it('advances onboarding step from Availability to Complete', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $this->actingAs($user)->put(route('onboarding.availability.update'), validSchedulePayload());

    expect($profile->fresh()->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

it('does not change onboarding step when already Complete', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);

    $this->actingAs($user)->put(route('onboarding.availability.update'), validSchedulePayload());

    expect($profile->fresh()->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

it('upserts schedule on repeated saves', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $this->actingAs($user)->put(route('onboarding.availability.update'), validSchedulePayload());
    $this->actingAs($user)->put(route('onboarding.availability.update'), validSchedulePayload());

    expect(BarberSchedule::query()->count())->toBe(1)
        ->and(BarberScheduleDay::query()->count())->toBe(7);
});

it('rejects invalid buffer_minutes value', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                   = validSchedulePayload();
    $payload['buffer_minutes'] = 7;

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('buffer_minutes');
});

it('rejects days array with fewer than 7 entries', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload         = validSchedulePayload();
    $payload['days'] = array_slice($payload['days'], 0, 5);

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days');
});

it('rejects time that is not a 15-minute increment', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                        = validSchedulePayload();
    $payload['days'][0]['opens_at'] = '09:07';

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days.0.opens_at');
});

it('rejects closes_at before opens_at', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                         = validSchedulePayload();
    $payload['days'][0]['opens_at']  = '18:00';
    $payload['days'][0]['closes_at'] = '09:00';

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days.0.closes_at');
});

it('rejects closes_at that is not a 15-minute increment', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                         = validSchedulePayload();
    $payload['days'][0]['closes_at'] = '18:07';

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days.0.closes_at');
});

it('rejects break_ends_at that is not a 15-minute increment', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                               = validSchedulePayload();
    $payload['days'][0]['break_starts_at'] = '12:00';
    $payload['days'][0]['break_ends_at']   = '13:07';

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days.0.break_ends_at');
});

it('rejects break_starts_at that is not a 15-minute increment', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $payload                               = validSchedulePayload();
    $payload['days'][0]['break_starts_at'] = '12:07';
    $payload['days'][0]['break_ends_at']   = '13:00';

    $response = $this->actingAs($user)->put(route('onboarding.availability.update'), $payload);

    $response->assertSessionHasErrors('days.0.break_starts_at');
});

it('redirects unauthenticated put request to login', function (): void {
    $response = $this->put(route('onboarding.availability.update'), validSchedulePayload());

    $response->assertRedirectToRoute('login');
});

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{buffer_minutes: int, days: array<int, array<string, mixed>>}
 */
function validSchedulePayload(): array
{
    $days = [];

    for ($i = 1; $i <= 7; $i++) {
        if ($i <= 5) {
            $days[] = [
                'day_of_week'     => $i,
                'is_open'         => true,
                'opens_at'        => '09:00',
                'closes_at'       => '18:00',
                'break_starts_at' => null,
                'break_ends_at'   => null,
            ];
        } else {
            $days[] = [
                'day_of_week'     => $i,
                'is_open'         => false,
                'opens_at'        => null,
                'closes_at'       => null,
                'break_starts_at' => null,
                'break_ends_at'   => null,
            ];
        }
    }

    return [
        'buffer_minutes' => 10,
        'days'           => $days,
    ];
}
