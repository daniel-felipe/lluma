<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;

it('has appointments relationship', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();
    $service = Service::factory()->forProfile($profile)->create();

    expect($service->appointments())->toBeInstanceOf(HasMany::class);
});

it('scope active filters active services', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();
    Service::factory()->forProfile($profile)->active()->create();
    Service::factory()->forProfile($profile)->inactive()->create();

    expect(Service::query()->active()->count())->toBe(1);
});

it('scope ordered sorts by sort_order ascending', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();
    Service::factory()->forProfile($profile)->create(['sort_order' => 2]);
    Service::factory()->forProfile($profile)->create(['sort_order' => 1]);

    $services = Service::query()->ordered()->get();

    expect($services->first()->sort_order)->toBe(1)
        ->and($services->last()->sort_order)->toBe(2);
});
