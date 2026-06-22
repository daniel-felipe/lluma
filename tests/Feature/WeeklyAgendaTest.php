<?php

declare(strict_types = 1);

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
function makeWeeklyBarber(): array
{
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
    ]);
    $service = Service::factory()->for($profile, 'barberProfile')->create(['is_active' => true]);

    return [$user, $profile, $service];
}

beforeEach(function (): void {
    // 2026-06-10 is a Wednesday; week = Mon 2026-06-08 … Sun 2026-06-14
    Date::setTestNow(Date::parse('2026-06-10 12:00:00'));
});

it('shows the current week appointments', function (): void {
    [$user, $profile, $service] = makeWeeklyBarber();

    $inWeek = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-12 10:00:00',
        'ends_at'   => '2026-06-12 10:30:00',
    ]);

    // Outside the week
    Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-15 10:00:00',
        'ends_at'   => '2026-06-15 10:30:00',
    ]);

    // Cancelled in week — hidden
    Appointment::factory()->for($profile)->for($service)->cancelled()->create([
        'starts_at' => '2026-06-12 14:00:00',
        'ends_at'   => '2026-06-12 14:30:00',
    ]);

    $this->actingAs($user)
        ->get(route('agenda.week'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('agenda/weekly')
            ->where('week_start', '2026-06-08')
            ->has('appointments', 1)
            ->where('appointments.0.id', $inWeek->id));
});

it('navigates to a specific week via start param', function (): void {
    [$user, $profile, $service] = makeWeeklyBarber();

    $nextWeek = Appointment::factory()->for($profile)->for($service)->confirmed()->create([
        'starts_at' => '2026-06-16 10:00:00',
        'ends_at'   => '2026-06-16 10:30:00',
    ]);

    $this->actingAs($user)
        ->get(route('agenda.week', ['start' => '2026-06-15']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('week_start', '2026-06-15')
            ->has('appointments', 1)
            ->where('appointments.0.id', $nextWeek->id));
});

it('requires authentication', function (): void {
    $this->get(route('agenda.week'))->assertRedirect(route('login'));
});
