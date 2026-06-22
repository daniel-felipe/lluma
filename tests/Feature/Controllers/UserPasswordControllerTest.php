<?php

declare(strict_types = 1);

use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use App\Models\User;
use App\Services\NullSmsGateway;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

it('renders reset password page', function (): void {
    $response = $this->fromRoute('home')
        ->get(route('password.reset', ['token' => 'fake-token']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('user-password/create')
            ->has('email')
            ->has('token'));
});

it('may reset password', function (): void {
    Event::fake([PasswordReset::class]);

    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $token = Password::createToken($user);

    $response = $this->fromRoute('password.reset', ['token' => $token])
        ->post(route('password.store'), [
            'email'                 => 'test@example.com',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
            'token'                 => $token,
        ]);

    $response->assertRedirectToRoute('login')
        ->assertSessionHas('status');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();

    Event::assertDispatched(PasswordReset::class);
});

it('fails with invalid token', function (): void {
    $user = User::factory()->create([
        'email' => 'test@example.com',
    ]);

    $response = $this->fromRoute('password.reset', ['token' => 'invalid-token'])
        ->post(route('password.store'), [
            'email'                 => 'test@example.com',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
            'token'                 => 'invalid-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'invalid-token']))
        ->assertSessionHasErrors('email');
});

it('fails with non-existent email', function (): void {
    $response = $this->fromRoute('password.reset', ['token' => 'fake-token'])
        ->post(route('password.store'), [
            'email'                 => 'nonexistent@example.com',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
            'token'                 => 'fake-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'fake-token']))
        ->assertSessionHasErrors('email');
});

it('requires email', function (): void {
    $response = $this->fromRoute('password.reset', ['token' => 'fake-token'])
        ->post(route('password.store'), [
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
            'token'                 => 'fake-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'fake-token']))
        ->assertSessionHasErrors('email');
});

it('requires password', function (): void {
    $response = $this->fromRoute('password.reset', ['token' => 'fake-token'])
        ->post(route('password.store'), [
            'email' => 'test@example.com',
            'token' => 'fake-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'fake-token']))
        ->assertSessionHasErrors('password');
});

it('requires password confirmation', function (): void {
    $response = $this->fromRoute('password.reset', ['token' => 'fake-token'])
        ->post(route('password.store'), [
            'email'    => 'test@example.com',
            'password' => 'new-password',
            'token'    => 'fake-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'fake-token']))
        ->assertSessionHasErrors('password');
});

it('requires matching password confirmation', function (): void {
    $response = $this->fromRoute('password.reset', ['token' => 'fake-token'])
        ->post(route('password.store'), [
            'email'                 => 'test@example.com',
            'password'              => 'new-password',
            'password_confirmation' => 'different-password',
            'token'                 => 'fake-token',
        ]);

    $response->assertRedirect(route('password.reset', ['token' => 'fake-token']))
        ->assertSessionHasErrors('password');
});

it('renders edit password page', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('dashboard')
        ->get(route('password.edit'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user-password/edit'));
});

it('may update password', function (): void {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)
        ->fromRoute('password.edit')
        ->put(route('password.update'), [
            'current_password'      => 'old-password',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertRedirectToRoute('password.edit');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

it('requires current password to update', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('password.edit')
        ->put(route('password.update'), [
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertRedirectToRoute('password.edit')
        ->assertSessionHasErrors('current_password');
});

it('requires correct current password to update', function (): void {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)
        ->fromRoute('password.edit')
        ->put(route('password.update'), [
            'current_password'      => 'wrong-password',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertRedirectToRoute('password.edit')
        ->assertSessionHasErrors('current_password');
});

it('requires new password to update', function (): void {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)
        ->fromRoute('password.edit')
        ->put(route('password.update'), [
            'current_password' => 'old-password',
        ]);

    $response->assertRedirectToRoute('password.edit')
        ->assertSessionHasErrors('password');
});

it('redirects authenticated users away from reset password', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->fromRoute('dashboard')
        ->get(route('password.reset', ['token' => 'fake-token']));

    $response->assertRedirectToRoute('dashboard');
});

// SMS-based password recovery (BarberPasswordResetController)

it('renders forgot phone password page', function (): void {
    $response = $this->fromRoute('home')
        ->get(route('password.forgot-phone'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user-password/forgot-phone'));
});

it('sends sms verification for registered phone', function (): void {
    NullSmsGateway::$sent = [];
    $user                 = User::factory()->phoneVerified()->create(['phone' => '+5531999990000']);

    $response = $this->fromRoute('password.forgot-phone')
        ->post(route('password.forgot-phone.store'), ['phone' => '(31) 99999-0000']);

    $response->assertRedirectToRoute('password.reset-phone');

    expect(NullSmsGateway::$sent)->toHaveCount(1);
    expect(SmsVerification::query()->where('phone', '+5531999990000')
        ->forPurpose(SmsVerificationPurpose::PasswordReset)
        ->exists())->toBeTrue();
});

it('returns same success response for unregistered phone without info leak', function (): void {
    NullSmsGateway::$sent = [];

    $response = $this->fromRoute('password.forgot-phone')
        ->post(route('password.forgot-phone.store'), ['phone' => '(31) 88888-8888']);

    $response->assertRedirectToRoute('password.reset-phone');

    expect(NullSmsGateway::$sent)->toHaveCount(0);
});

it('renders sms reset password page', function (): void {
    $response = $this->fromRoute('home')
        ->get(route('password.reset-phone'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user-password/reset-phone'));
});

it('resets password with correct sms code', function (): void {
    $user         = User::factory()->phoneVerified()->create(['phone' => '+5531999990000']);
    $verification = SmsVerification::factory()->forPasswordReset()->create([
        'phone' => '+5531999990000',
        'code'  => Hash::make('123456'),
    ]);

    $response = $this->fromRoute('password.reset-phone')
        ->post(route('password.reset-phone.store'), [
            'phone'                 => '(31) 99999-0000',
            'code'                  => '123456',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertRedirectToRoute('login');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

it('returns error for expired sms code on password reset', function (): void {
    $user = User::factory()->phoneVerified()->create(['phone' => '+5531999990000']);
    SmsVerification::factory()->forPasswordReset()->expired()->create([
        'phone' => '+5531999990000',
        'code'  => Hash::make('123456'),
    ]);

    $response = $this->fromRoute('password.reset-phone')
        ->post(route('password.reset-phone.store'), [
            'phone'                 => '(31) 99999-0000',
            'code'                  => '123456',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertSessionHasErrors('code');
});

it('returns error for exhausted sms code on password reset', function (): void {
    $user = User::factory()->phoneVerified()->create(['phone' => '+5531999990000']);
    SmsVerification::factory()->forPasswordReset()->exhausted()->create([
        'phone' => '+5531999990000',
        'code'  => Hash::make('123456'),
    ]);

    $response = $this->fromRoute('password.reset-phone')
        ->post(route('password.reset-phone.store'), [
            'phone'                 => '(31) 99999-0000',
            'code'                  => '123456',
            'password'              => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response->assertSessionHasErrors('code');
});
