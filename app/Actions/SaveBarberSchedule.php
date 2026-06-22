<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use Illuminate\Support\Facades\DB;

final readonly class SaveBarberSchedule
{
    /**
     * @param  array{buffer_minutes: int, days: array<int, array{day_of_week: int, is_open: bool, opens_at: string|null, closes_at: string|null, break_starts_at: string|null, break_ends_at: string|null}>}  $data
     */
    public function run(BarberProfile $profile, array $data): BarberSchedule
    {
        return DB::transaction(function () use ($profile, $data): BarberSchedule {
            /** @var BarberSchedule $schedule */
            $schedule = BarberSchedule::query()->updateOrCreate(['barber_profile_id' => $profile->id], ['buffer_minutes' => $data['buffer_minutes']]);

            foreach ($data['days'] as $dayData) {
                $schedule->days()->updateOrCreate(
                    ['day_of_week' => $dayData['day_of_week']],
                    [
                        'is_open'         => $dayData['is_open'],
                        'opens_at'        => $dayData['opens_at'] !== null ? $dayData['opens_at'] . ':00' : null,
                        'closes_at'       => $dayData['closes_at'] !== null ? $dayData['closes_at'] . ':00' : null,
                        'break_starts_at' => $dayData['break_starts_at'] !== null ? $dayData['break_starts_at'] . ':00' : null,
                        'break_ends_at'   => $dayData['break_ends_at'] !== null ? $dayData['break_ends_at'] . ':00' : null,
                    ],
                );
            }

            if ($profile->onboarding_step === BarberOnboardingStep::Availability) {
                $profile->update(['onboarding_step' => BarberOnboardingStep::Complete]);
            }

            return $schedule->fresh() ?? $schedule;
        });
    }
}
