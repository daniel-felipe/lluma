<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Http\Requests\CreateSessionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final readonly class SessionController
{
    public function create(Request $request): Response
    {
        return Inertia::render('session/create', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => $request->session()->get('status'),
            'throttledUntil'   => $request->session()->get('throttledUntil'),
        ]);
    }

    public function store(CreateSessionRequest $request): RedirectResponse
    {
        $identifier = $request->string('identifier')->toString();
        $lockKey    = 'login_locked_until:' . $identifier;
        $failureKey = 'login_failures:' . $identifier;

        $lockedUntil = Cache::get($lockKey);

        if (is_string($lockedUntil) && now()->lt(Date::parse($lockedUntil))) {
            return back()->with('throttledUntil', $lockedUntil);
        }

        try {
            $user = $request->validateCredentials();
        } catch (ValidationException $validationException) {
            $previous     = Cache::get($failureKey);
            $failureCount = is_int($previous) ? $previous + 1 : 1;
            Cache::put($failureKey, $failureCount, 3600);

            if ($failureCount >= 10) {
                $duration = match (true) {
                    $failureCount >= 30 => 900,
                    $failureCount >= 20 => 300,
                    default             => 60,
                };
                $until = now()->addSeconds($duration)->toIso8601String();
                Cache::put($lockKey, $until, $duration);

                return back()->with('throttledUntil', $until);
            }

            throw $validationException;
        }

        Cache::forget($failureKey);
        Cache::forget($lockKey);

        if ($user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put([
                'login.id'       => $user->getKey(),
                'login.remember' => $request->boolean('remember'),
            ]);

            return to_route('two-factor.login');
        }

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
