<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;

it('shows the share page with the public url and analytics', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->published()->create([
        'onboarding_step' => BarberOnboardingStep::Complete,
        'link_visits'     => 10,
    ]);
    $service = Service::factory()->for($profile, 'barberProfile')->create();

    Appointment::factory()->for($profile)->for($service)->confirmed()->count(2)->create();
    Appointment::factory()->for($profile)->for($service)->cancelled()->create();

    $this->actingAs($user)
        ->get(route('share.show'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('share/show')
            ->where('public_url', route('barbers.show', $profile))
            ->where('analytics.visits', 10)
            ->where('analytics.bookings', 2)
            ->where('analytics.conversion_rate', 20));
});

it('counts public page visits', function (): void {
    $profile = BarberProfile::factory()->for(User::factory())->published()->create();

    expect($profile->refresh()->link_visits)->toBe(0);

    $this->get('/' . $profile->slug)->assertOk();
    $this->get('/' . $profile->slug)->assertOk();

    expect($profile->refresh()->link_visits)->toBe(2);
});

it('requires authentication for the share page', function (): void {
    $this->get(route('share.show'))->assertRedirect(route('login'));
});
