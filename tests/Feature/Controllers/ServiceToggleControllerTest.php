<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;

it('deactivates an active service via toggle', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    Service::factory()->forProfile($profile)->active()->create();
    $service = Service::factory()->forProfile($profile)->active()->create();

    $response = $this->actingAs($user)->patch(route('onboarding.services.toggle', $service));

    $response->assertRedirect(route('onboarding.services.index'));

    expect($service->fresh()->is_active)->toBeFalse();
});

it('reactivates an inactive service via toggle', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    Service::factory()->forProfile($profile)->active()->create();
    $service = Service::factory()->forProfile($profile)->inactive()->create();

    $response = $this->actingAs($user)->patch(route('onboarding.services.toggle', $service));

    $response->assertRedirect(route('onboarding.services.index'));

    expect($service->fresh()->is_active)->toBeTrue();
});

it('blocks deactivating the last active service with error message', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($profile)->active()->create();

    $response = $this->actingAs($user)->patch(route('onboarding.services.toggle', $service));

    $response->assertRedirect();
    $response->assertSessionHasErrors('service');

    expect($service->fresh()->is_active)->toBeTrue();
});

it('returns 404 when toggling service belonging to another barber', function (): void {
    $user         = User::factory()->phoneVerified()->create();
    $otherUser    = User::factory()->phoneVerified()->create();
    $otherProfile = BarberProfile::factory()->for($otherUser)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($otherProfile)->active()->create();

    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->patch(route('onboarding.services.toggle', $service));

    $response->assertNotFound();
});
