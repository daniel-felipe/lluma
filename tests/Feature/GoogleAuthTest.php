<?php

declare(strict_types = 1);

use App\Models\User;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Two\User as SocialiteUser;

beforeEach(function (): void {
    $this->googleUser = (new SocialiteUser)->map([
        'id'        => 'google-id-123',
        'name'      => 'John Doe',
        'email'     => 'john@example.com',
        'avatar'    => 'https://example.com/avatar.jpg',
        'token'     => 'token',
        'expiresIn' => 3600,
    ]);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($this->googleUser);
    $provider->shouldReceive('redirect')->andReturn(redirect('/auth/google'));

    $socialite = Mockery::mock(SocialiteFactory::class);
    $socialite->shouldReceive('driver')->with('google')->andReturn($provider);

    $this->app->instance(SocialiteFactory::class, $socialite);
});

it('creates a new user on first google login', function (): void {
    $this->get(route('auth.google.callback'))
        ->assertRedirectToRoute('dashboard');

    expect(User::query()->where('email', 'john@example.com')->exists())->toBeTrue();

    $user = User::query()->where('email', 'john@example.com')->first();
    expect($user->google_id)->toBe('google-id-123');
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->password)->toBeNull();
});

it('logs in existing google user without creating duplicate', function (): void {
    $existing = User::factory()->create([
        'email'     => 'john@example.com',
        'google_id' => 'google-id-123',
    ]);

    $this->get(route('auth.google.callback'))
        ->assertRedirectToRoute('dashboard');

    expect(User::query()->where('email', 'john@example.com')->count())->toBe(1);
    $this->assertAuthenticatedAs($existing);
});

it('links google id to existing email-password user', function (): void {
    $existing = User::factory()->create([
        'email'     => 'john@example.com',
        'google_id' => null,
    ]);

    $this->get(route('auth.google.callback'))
        ->assertRedirectToRoute('dashboard');

    expect(User::query()->count())->toBe(1);
    expect($existing->fresh()->google_id)->toBe('google-id-123');
    $this->assertAuthenticatedAs($existing);
});

it('redirects to google when visiting auth.google route', function (): void {
    $this->get(route('auth.google'))
        ->assertRedirect();
});
