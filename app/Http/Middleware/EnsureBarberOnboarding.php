<?php

declare(strict_types = 1);

namespace App\Http\Middleware;

use App\Enums\BarberOnboardingStep;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureBarberOnboarding
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $routeName = $request->route()?->getName() ?? '';

        // Skip for onboarding routes, logout, and settings
        if (
            str_starts_with($routeName, 'onboarding.')
            || str_starts_with($routeName, 'settings.')
            || $routeName === 'logout'
        ) {
            return $next($request);
        }

        $profile = $user->barberProfile;

        if (! $profile) {
            return to_route('onboarding.profile.edit');
        }

        return match ($profile->onboarding_step) {
            BarberOnboardingStep::Profile                                      => to_route('onboarding.profile.edit'),
            BarberOnboardingStep::Services                                     => to_route('onboarding.services.index'),
            BarberOnboardingStep::Availability, BarberOnboardingStep::Complete => $next($request),
        };
    }
}
