<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Models\User;

final readonly class CreateUserEmailVerificationNotification
{
    public function run(User $user): void
    {
        $user->sendEmailVerificationNotification();
    }
}
