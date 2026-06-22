<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;

it('saves the new order correctly', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $serviceA = Service::factory()->forProfile($profile)->create(['sort_order' => 1]);
    $serviceB = Service::factory()->forProfile($profile)->create(['sort_order' => 2]);
    $serviceC = Service::factory()->forProfile($profile)->create(['sort_order' => 3]);

    $response = $this->actingAs($user)->patch(route('onboarding.services.order'), [
        'order' => [$serviceC->id, $serviceA->id, $serviceB->id],
    ]);

    $response->assertRedirect(route('onboarding.services.index'));
    expect($serviceC->fresh()->sort_order)->toBe(1)
        ->and($serviceA->fresh()->sort_order)->toBe(2)
        ->and($serviceB->fresh()->sort_order)->toBe(3);
});

it('rejects array containing IDs from another barber with 422', function (): void {
    $user      = User::factory()->phoneVerified()->create();
    $otherUser = User::factory()->phoneVerified()->create();
    $profile   = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $otherProfile = BarberProfile::factory()->for($otherUser)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $myService    = Service::factory()->forProfile($profile)->create();
    $otherService = Service::factory()->forProfile($otherProfile)->create();

    $response = $this->actingAs($user)->patch(route('onboarding.services.order'), [
        'order' => [$myService->id, $otherService->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('order');
});

it('rejects an empty order array', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->patch(route('onboarding.services.order'), [
        'order' => [],
    ]);

    $response->assertSessionHasErrors('order');
});

it('returns 404 for barber without profile', function (): void {
    $user = User::factory()->phoneVerified()->create();

    $response = $this->actingAs($user)->patch(route('onboarding.services.order'), [
        'order' => ['some-uuid'],
    ]);

    $response->assertNotFound();
});
