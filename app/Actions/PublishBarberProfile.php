<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class PublishBarberProfile
{
    public function run(User $user): BarberProfile
    {
        /** @var BarberProfile|null $profile */
        $profile = $user->barberProfile;

        if (! $profile) {
            return new BarberProfile();
        }

        if ($profile->status === BarberProfileStatus::Published) {
            return $profile;
        }

        if ($profile->services()->where('is_active', true)->count() === 0) {
            return $profile;
        }

        if ($profile->schedule === null) {
            return $profile;
        }

        return DB::transaction(function () use ($profile): BarberProfile {
            $profile->update([
                'status'          => BarberProfileStatus::Published,
                'onboarding_step' => BarberOnboardingStep::Complete,
            ]);

            return $profile->fresh() ?? $profile;
        });
    }
}
