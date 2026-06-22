<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\UpdateBarberProfile;
use App\Http\Requests\UpdateBarberProfileRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BarberProfileController
{
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $profileData = $profile ? [
            'business_name'        => $profile->business_name,
            'slug'                 => $profile->slug,
            'address_street'       => $profile->address_street,
            'address_number'       => $profile->address_number,
            'address_neighborhood' => $profile->address_neighborhood,
            'address_city'         => $profile->address_city,
            'address_state'        => $profile->address_state,
            'address_cep'          => $profile->address_cep,
            'profile_photo_url'    => $profile->profile_photo_url,
            'cover_photo_url'      => $profile->cover_photo_url,
        ] : null;

        return Inertia::render('onboarding/profile', [
            'barber' => [
                'name'  => $user->name,
                'phone' => $user->phone,
            ],
            'profile'         => $profileData,
            'onboarding_step' => 'profile',
            'steps'           => ['profile', 'services', 'availability'],
        ]);
    }

    public function update(UpdateBarberProfileRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $data = array_diff_key(
            $request->validated(),
            array_flip(['profile_photo', 'cover_photo'])
        );
        resolve(UpdateBarberProfile::class)->run(
            $user,
            $data,
            $request->file('profile_photo'),
            $request->file('cover_photo'),
        );

        return to_route('dashboard');
    }
}
