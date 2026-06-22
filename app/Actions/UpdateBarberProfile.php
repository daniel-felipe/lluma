<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

final readonly class UpdateBarberProfile
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function run(User $user, array $data, ?UploadedFile $profilePhoto, ?UploadedFile $coverPhoto): BarberProfile
    {
        return DB::transaction(function () use ($user, $data, $profilePhoto, $coverPhoto): BarberProfile {
            $user->update(['name' => $data['name']]);

            $profilePhotoUrl = $profilePhoto instanceof UploadedFile
                ? $profilePhoto->storePublicly('barbers/photos', 'public')
                : null;

            $coverPhotoUrl = $coverPhoto instanceof UploadedFile
                ? $coverPhoto->storePublicly('barbers/photos', 'public')
                : null;

            $profileData = [
                'business_name'        => $data['business_name'],
                'slug'                 => $data['slug'],
                'address_street'       => $data['address_street'],
                'address_number'       => $data['address_number'],
                'address_neighborhood' => $data['address_neighborhood'],
                'address_city'         => $data['address_city'],
                'address_state'        => $data['address_state'],
                'address_cep'          => $data['address_cep'] ?? null,
                'onboarding_step'      => BarberOnboardingStep::Services,
            ];

            if ($profilePhotoUrl !== null) {
                $profileData['profile_photo_url'] = $profilePhotoUrl;
            }

            if ($coverPhotoUrl !== null) {
                $profileData['cover_photo_url'] = $coverPhotoUrl;
            }

            /** @var BarberProfile */
            return BarberProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData,
            );
        });
    }
}
