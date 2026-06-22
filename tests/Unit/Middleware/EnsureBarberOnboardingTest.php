<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Http\Middleware\EnsureBarberOnboarding;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Route;

it('passes through unauthenticated requests', function (): void {
    $middleware = new EnsureBarberOnboarding();
    $request    = Request::create('/dashboard', 'GET');

    $called   = false;
    $response = $middleware->handle($request, function () use (&$called): Response {
        $called = true;

        return response('OK');
    });

    expect($called)->toBeTrue();
});

it('passes through onboarding routes', function (): void {
    $user    = User::factory()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Profile,
    ]);

    $middleware = new EnsureBarberOnboarding();
    $request    = Request::create('/onboarding/profile', 'GET');
    $request->setUserResolver(fn () => $user);
    $request->setRouteResolver(function (): Route {
        $route = new Route('GET', '/onboarding/profile', []);
        $route->name('onboarding.profile.edit');

        return $route;
    });

    $called   = false;
    $response = $middleware->handle($request, function () use (&$called): Response {
        $called = true;

        return response('OK');
    });

    expect($called)->toBeTrue();
});

it('redirects to profile edit when user has no barber profile', function (): void {
    $user = User::factory()->create();

    $middleware = new EnsureBarberOnboarding();
    $request    = Request::create('/dashboard', 'GET');
    $request->setUserResolver(fn () => $user);
    $request->setRouteResolver(function (): Route {
        $route = new Route('GET', '/dashboard', []);
        $route->name('dashboard');

        return $route;
    });

    $response = $middleware->handle($request, fn (): ResponseFactory | Response => response('OK'));

    expect($response->getStatusCode())->toBe(302)
        ->and($response->headers->get('location'))->toContain('onboarding/profile');
});

it('redirects to services when profile step is services', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->draft()->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $middleware = new EnsureBarberOnboarding();
    $request    = Request::create('/dashboard', 'GET');
    $request->setUserResolver(fn () => $user);
    $request->setRouteResolver(function (): Route {
        $route = new Route('GET', '/dashboard', []);
        $route->name('dashboard');

        return $route;
    });

    $response = $middleware->handle($request, fn (): ResponseFactory | Response => response('OK'));

    expect($response->getStatusCode())->toBe(302)
        ->and($response->headers->get('location'))->toContain('onboarding/services');
});
