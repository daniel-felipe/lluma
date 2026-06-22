<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasOne;

it('has schedule relationship', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();

    expect($profile->schedule())->toBeInstanceOf(HasOne::class);
});

it('schedule relationship returns null when no schedule exists', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create();

    expect($profile->schedule)->toBeNull();
});

it('schedule relationship returns schedule when one exists', function (): void {
    $user     = User::factory()->create();
    $profile  = BarberProfile::factory()->for($user)->create();
    $schedule = BarberSchedule::factory()->forProfile($profile)->create();

    expect($profile->schedule)->toBeInstanceOf(BarberSchedule::class)
        ->and($profile->schedule->id)->toBe($schedule->id);
});

it('scope published filters to published profiles', function (): void {
    $published = User::factory()->create();
    $draft     = User::factory()->create();
    BarberProfile::factory()->for($published)->published()->create();
    BarberProfile::factory()->for($draft)->draft()->create();

    expect(BarberProfile::query()->published()->count())->toBe(1);
});

it('scope published excludes draft profiles', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->draft()->create();

    expect(BarberProfile::query()->published()->find($profile->id))->toBeNull();
});
