<?php

declare(strict_types = 1);

use App\Actions\SaveBarberSchedule;
use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\User;

it('creates a new schedule with all 7 days', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    expect(BarberSchedule::query()->count())->toBe(1)
        ->and(BarberScheduleDay::query()->count())->toBe(7);
});

it('returns the saved BarberSchedule', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action   = resolve(SaveBarberSchedule::class);
    $schedule = $action->run($profile, scheduleData());

    expect($schedule)->toBeInstanceOf(BarberSchedule::class)
        ->and($schedule->buffer_minutes)->toBe(10);
});

it('appends :00 seconds to HH:MM time strings', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    $day = BarberScheduleDay::query()->where('day_of_week', 1)->first();
    expect($day->opens_at)->toBe('09:00:00')
        ->and($day->closes_at)->toBe('18:00:00');
});

it('stores break times when provided', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $data                               = scheduleData();
    $data['days'][0]['break_starts_at'] = '12:00';
    $data['days'][0]['break_ends_at']   = '13:00';

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, $data);

    $day = BarberScheduleDay::query()->where('day_of_week', 1)->first();
    expect($day->break_starts_at)->toBe('12:00:00')
        ->and($day->break_ends_at)->toBe('13:00:00');
});

it('stores null for time fields on closed days', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    // Day 7 (Sunday) is closed in scheduleData()
    $day = BarberScheduleDay::query()->where('day_of_week', 7)->first();
    expect($day->opens_at)->toBeNull()
        ->and($day->closes_at)->toBeNull()
        ->and($day->break_starts_at)->toBeNull()
        ->and($day->break_ends_at)->toBeNull();
});

it('upserts schedule on repeated calls without duplicating rows', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    $updatedData                   = scheduleData();
    $updatedData['buffer_minutes'] = 30;

    $action->run($profile, $updatedData);

    expect(BarberSchedule::query()->count())->toBe(1)
        ->and(BarberScheduleDay::query()->count())->toBe(7)
        ->and($profile->schedule->buffer_minutes)->toBe(30);
});

it('advances onboarding step from Availability to Complete', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    expect($profile->fresh()->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

it('does not modify onboarding step when already Complete', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    expect($profile->fresh()->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

it('completes onboarding when saving from an earlier in-progress step', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $action = resolve(SaveBarberSchedule::class);
    $action->run($profile, scheduleData());

    expect($profile->fresh()->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

/**
 * @return array{buffer_minutes: int, days: array<int, array<string, mixed>>}
 */
function scheduleData(): array
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
