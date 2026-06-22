<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Contracts\User as SocialiteUser;

final readonly class FindOrCreateGoogleUserAction
{
    public function run(SocialiteUser $googleUser): User
    {
        return DB::transaction(function () use ($googleUser): User {
            $existing = User::query()->where('google_id', $googleUser->getId())->first();

            if ($existing instanceof User) {
                return $existing;
            }

            $byEmail = User::query()->where('email', $googleUser->getEmail())->first();

            if ($byEmail instanceof User) {
                $byEmail->update([
                    'google_id'         => $googleUser->getId(),
                    'email_verified_at' => $byEmail->email_verified_at ?? now(),
                ]);

                return $byEmail;
            }

            $user = User::query()->create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'email_verified_at' => now(),
                'password'          => null,
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
