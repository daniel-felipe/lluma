<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

it('renders login page', function (): void {
    $response = $this->fromRoute('home')
        ->get(route('login'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('session/create')
            ->has('canResetPassword')
            ->has('status'));
});

it('may create a session with email identifier', function (): void {
    $user = User::factory()->withoutTwoFactor()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('dashboard');

    $this->assertAuthenticatedAs($user);
});

it('may create a session with phone identifier', function (): void {
    $user = User::factory()->withoutTwoFactor()->phoneVerified()->create([
        'phone'    => '+5531999990000',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => '(31) 99999-0000',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('dashboard');

    $this->assertAuthenticatedAs($user);
});

it('fails gracefully when login identifier has non-matchable digits', function (): void {
    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => '123456789012',
            'password'   => 'password',
        ]);

    $response->assertSessionHasErrors('identifier');
});

it('may create a session with E.164 phone identifier', function (): void {
    $user = User::factory()->withoutTwoFactor()->phoneVerified()->create([
        'phone'    => '+5531999990000',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => '+5531999990000',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('dashboard');

    $this->assertAuthenticatedAs($user);
});

it('may create a session with remember me', function (): void {
    $user = User::factory()->withoutTwoFactor()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'password',
            'remember'   => true,
        ]);

    $response->assertRedirectToRoute('dashboard');

    $this->assertAuthenticatedAs($user);
});

it('redirects to two-factor challenge when enabled', function (): void {
    $user = User::factory()->create([
        'email'                     => 'test@example.com',
        'password'                  => Hash::make('password'),
        'two_factor_secret'         => encrypt('secret'),
        'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
        'two_factor_confirmed_at'   => now(),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('two-factor.login');

    $this->assertGuest();
});

it('fails with invalid credentials', function (): void {
    User::factory()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'wrong-password',
        ]);

    $response->assertRedirectToRoute('login')
        ->assertSessionHasErrors('identifier');

    $this->assertGuest();
});

it('fails with unknown identifier without leaking user existence', function (): void {
    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'nonexistent@example.com',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('login')
        ->assertSessionHasErrors('identifier');

    $this->assertGuest();
});

it('requires identifier', function (): void {
    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'password' => 'password',
        ]);

    $response->assertRedirectToRoute('login')
        ->assertSessionHasErrors('identifier');
});

it('requires password', function (): void {
    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
        ]);

    $response->assertRedirectToRoute('login')
        ->assertSessionHasErrors('password');
});

it('may destroy a session', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('dashboard')
        ->post(route('logout'));

    $response->assertRedirect('/');

    $this->assertGuest();
});

it('redirects authenticated users away from login', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->published()->create();

    $response = $this->actingAs($user)
        ->fromRoute('dashboard')
        ->get(route('login'));

    $response->assertRedirectToRoute('dashboard');
});

it('locks login after 10 failed attempts with throttledUntil', function (): void {
    User::factory()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    for ($i = 0; $i < 10; $i++) {
        $this->fromRoute('login')
            ->post(route('login.store'), [
                'identifier' => 'test@example.com',
                'password'   => 'wrong-password',
            ]);
    }

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'wrong-password',
        ]);

    $response->assertRedirect()
        ->assertSessionHas('throttledUntil');
});

it('clears lock after successful login', function (): void {
    Cache::put('login_locked_until:test@example.com', now()->subSecond()->toIso8601String(), 1);
    Cache::put('login_failures:test@example.com', 10, 3600);

    $user = User::factory()->withoutTwoFactor()->create([
        'email'    => 'test@example.com',
        'password' => Hash::make('password'),
    ]);

    $response = $this->fromRoute('login')
        ->post(route('login.store'), [
            'identifier' => 'test@example.com',
            'password'   => 'password',
        ]);

    $response->assertRedirectToRoute('dashboard');
    $this->assertAuthenticatedAs($user);
    expect(Cache::has('login_failures:test@example.com'))->toBeFalse();
});

it('redirects barber without completed profile to onboarding after login', function (): void {
    $user = User::factory()->withoutTwoFactor()->create([
        'email'    => 'barber@example.com',
        'password' => Hash::make('password'),
    ]);
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->fromRoute('login')
        ->followingRedirects()
        ->post(route('login.store'), [
            'identifier' => 'barber@example.com',
            'password'   => 'password',
        ]);

    $response->assertInertia(fn ($page) => $page->component('onboarding/profile'));
});
