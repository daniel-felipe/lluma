<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

final readonly class GoogleRedirectController
{
    public function __invoke(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }
}
