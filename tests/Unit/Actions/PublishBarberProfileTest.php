<?php

declare(strict_types = 1);

use App\Actions\PublishBarberProfile;
use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\Service;
use App\Models\User;

it('returns unchanged draft profile when services count is zero', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->draft()->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $action = resolve(PublishBarberProfile::class);
    $result = $action->run($user);

    expect($result->status)->toBe(BarberProfileStatus::Draft);
});

it('returns unchanged draft profile when availability count is zero', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->draft()->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);
    Service::factory()->forProfile($profile)->active()->create();

    $action = resolve(PublishBarberProfile::class);
    $result = $action->run($user);

    expect($result->status)->toBe(BarberProfileStatus::Draft);
});

it('returns empty BarberProfile when user has no profile', function (): void {
    $user = User::factory()->create();

    $action = resolve(PublishBarberProfile::class);
    $result = $action->run($user);

    expect($result->exists)->toBeFalse();
});

it('publishes profile when services and schedule exist', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->draft()->create([
        'onboarding_step' => BarberOnboardingStep::Availability,
    ]);
    Service::factory()->forProfile($profile)->active()->create();
    BarberSchedule::factory()->forProfile($profile)->create();

    $action = resolve(PublishBarberProfile::class);
    $result = $action->run($user);

    expect($result->status)->toBe(BarberProfileStatus::Published)
        ->and($result->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});

it('is idempotent on already published profile', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->published()->create();

    $action = resolve(PublishBarberProfile::class);
    $result = $action->run($user);

    expect($result->status)->toBe(BarberProfileStatus::Published)
        ->and($result->onboarding_step)->toBe(BarberOnboardingStep::Complete);
});
