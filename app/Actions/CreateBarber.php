<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use SensitiveParameter;

final readonly class CreateBarber
{
    public function run(string $phone, #[SensitiveParameter] string $password): User
    {
        return DB::transaction(function () use ($phone, $password): User {
            $user = User::query()->create([
                'phone'             => $phone,
                'phone_verified_at' => now(),
                'password'          => $password,
            ]);

            event(new Registered($user));

            return $user;
        });
    }
}
