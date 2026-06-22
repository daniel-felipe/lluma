<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use App\Models\User;

final readonly class InitializeBarberProfile
{
    public function run(User $user): BarberProfile
    {
        /** @var BarberProfile */
        return BarberProfile::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'slug'                 => $user->id,
                'business_name'        => '',
                'address_street'       => '',
                'address_number'       => '',
                'address_neighborhood' => '',
                'address_city'         => '',
                'address_state'        => '',
                'status'               => BarberProfileStatus::Draft,
                'onboarding_step'      => BarberOnboardingStep::Profile,
            ]
        );
    }
}
