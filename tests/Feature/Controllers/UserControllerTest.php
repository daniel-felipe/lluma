<?php

declare(strict_types = 1);

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;

it('renders register page', function (): void {
    $response = $this->get(route('register'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user/create'));
});

it('may register with email and password', function (): void {
    Event::fake([Registered::class]);

    $response = $this->fromRoute('register')
        ->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

    $response->assertRedirectToRoute('dashboard');

    $user = User::query()->where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull();

    $this->assertAuthenticatedAs($user);

    Event::assertDispatched(Registered::class);
});

it('fails registration with duplicate email', function (): void {
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->fromRoute('register')
        ->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'taken@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

    $response->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('fails registration with weak password', function (): void {
    $response = $this->fromRoute('register')
        ->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'weak',
            'password_confirmation' => 'weak',
        ]);

    $response->assertSessionHasErrors('password');

    $this->assertGuest();
});

it('fails registration when passwords do not match', function (): void {
    $response = $this->fromRoute('register')
        ->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Different123!',
        ]);

    $response->assertSessionHasErrors('password');

    $this->assertGuest();
});

it('fails registration with invalid email', function (): void {
    $response = $this->fromRoute('register')
        ->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'not-an-email',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

    $response->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('may delete user account', function (): void {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->actingAs($user)
        ->fromRoute('user-profile.edit')
        ->delete(route('user.destroy'), [
            'password' => 'password',
        ]);

    $response->assertRedirectToRoute('home');

    expect($user->fresh())->toBeNull();

    $this->assertGuest();
});

it('requires password to delete account', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('user-profile.edit')
        ->delete(route('user.destroy'), []);

    $response->assertRedirectToRoute('user-profile.edit')
        ->assertSessionHasErrors('password');

    expect($user->fresh())->not->toBeNull();
});

it('requires correct password to delete account', function (): void {
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $response = $this->actingAs($user)
        ->fromRoute('user-profile.edit')
        ->delete(route('user.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response->assertRedirectToRoute('user-profile.edit')
        ->assertSessionHasErrors('password');

    expect($user->fresh())->not->toBeNull();
});
