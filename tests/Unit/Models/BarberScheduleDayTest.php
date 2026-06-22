<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

it('has barberSchedule relationship', function (): void {
    $user     = User::factory()->create();
    $profile  = BarberProfile::factory()->for($user)->create();
    $schedule = BarberSchedule::factory()->forProfile($profile)->create();
    $day      = BarberScheduleDay::factory()->forSchedule($schedule)->create();

    expect($day->barberSchedule())->toBeInstanceOf(BelongsTo::class)
        ->and($day->barberSchedule->id)->toBe($schedule->id);
});
