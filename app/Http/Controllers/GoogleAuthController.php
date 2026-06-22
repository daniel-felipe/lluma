<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\FindOrCreateGoogleUserAction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

final readonly class GoogleAuthController
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = resolve(FindOrCreateGoogleUserAction::class)->run($googleUser);

        Auth::login($user, remember: true);

        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
