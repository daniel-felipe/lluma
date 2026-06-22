<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

it('has barberProfile relationship', function (): void {
    $user     = User::factory()->create();
    $profile  = BarberProfile::factory()->for($user)->create();
    $schedule = BarberSchedule::factory()->forProfile($profile)->create();

    expect($schedule->barberProfile())->toBeInstanceOf(BelongsTo::class)
        ->and($schedule->barberProfile->id)->toBe($profile->id);
});

it('has days relationship', function (): void {
    $user     = User::factory()->create();
    $profile  = BarberProfile::factory()->for($user)->create();
    $schedule = BarberSchedule::factory()->forProfile($profile)->create();

    expect($schedule->days())->toBeInstanceOf(HasMany::class);
});

it('casts buffer_minutes to integer', function (): void {
    $user     = User::factory()->create();
    $profile  = BarberProfile::factory()->for($user)->create();
    $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(15)->create();

    expect($schedule->buffer_minutes)->toBeInt()->toBe(15);
});
