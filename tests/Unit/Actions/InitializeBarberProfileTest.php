<?php

declare(strict_types = 1);

use App\Actions\InitializeBarberProfile;
use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use App\Models\User;

it('creates barber profile with correct default values', function (): void {
    $user = User::factory()->create();

    $action  = resolve(InitializeBarberProfile::class);
    $profile = $action->run($user);

    expect($profile)->toBeInstanceOf(BarberProfile::class)
        ->and($profile->user_id)->toBe($user->id)
        ->and($profile->status)->toBe(BarberProfileStatus::Draft)
        ->and($profile->onboarding_step)->toBe(BarberOnboardingStep::Profile);
});

it('uses user uuid as slug placeholder', function (): void {
    $user = User::factory()->create();

    $action  = resolve(InitializeBarberProfile::class);
    $profile = $action->run($user);

    expect($profile->slug)->toBe($user->id)
        ->and($profile->slug)->not->toBeEmpty();
});

it('is idempotent - calling twice does not create duplicate', function (): void {
    $user = User::factory()->create();

    $action = resolve(InitializeBarberProfile::class);
    $action->run($user);
    $action->run($user);

    expect(BarberProfile::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('returns existing profile if already initialized', function (): void {
    $user = User::factory()->create();

    $action = resolve(InitializeBarberProfile::class);
    $first  = $action->run($user);
    $second = $action->run($user);

    expect($first->id)->toBe($second->id);
});

it('creates separate profiles for different users', function (): void {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $action   = resolve(InitializeBarberProfile::class);
    $profileA = $action->run($userA);
    $profileB = $action->run($userB);

    expect($profileA->id)->not->toBe($profileB->id)
        ->and($profileA->slug)->toBe($userA->id)
        ->and($profileB->slug)->toBe($userB->id);
});
