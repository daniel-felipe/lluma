<?php

declare(strict_types = 1);

use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('renders the forgot phone page', function (): void {
    $response = $this->get(route('password.forgot-phone'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user-password/forgot-phone'));
});

it('sends sms when phone belongs to a user', function (): void {
    User::factory()->create(['phone' => '+5531999990000']);

    $response = $this->post(route('password.forgot-phone.store'), [
        'phone' => '(31) 99999-0000',
    ]);

    $response->assertRedirectToRoute('password.reset-phone');
});

it('redirects silently when phone does not belong to any user', function (): void {
    $response = $this->post(route('password.forgot-phone.store'), [
        'phone' => '(31) 99999-0000',
    ]);

    $response->assertRedirectToRoute('password.reset-phone');
});

it('renders the reset phone page', function (): void {
    $response = $this->get(route('password.reset-phone'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('user-password/reset-phone'));
});

it('resets password with valid code', function (): void {
    $user = User::factory()->create(['phone' => '+5531999990000']);
    SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::PasswordReset,
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->post(route('password.reset-phone.store'), [
        'phone'                 => '(31) 99999-0000',
        'code'                  => '123456',
        'password'              => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirectToRoute('login');

    expect(Hash::check('newpassword123', $user->fresh()->password))->toBeTrue();
});

it('returns error for invalid sms code', function (): void {
    User::factory()->create(['phone' => '+5531999990000']);
    SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::PasswordReset,
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->post(route('password.reset-phone.store'), [
        'phone'                 => '(31) 99999-0000',
        'code'                  => '000000',
        'password'              => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('code');
});

it('returns error when no active sms code exists', function (): void {
    User::factory()->create(['phone' => '+5531999990000']);

    $response = $this->post(route('password.reset-phone.store'), [
        'phone'                 => '(31) 99999-0000',
        'code'                  => '123456',
        'password'              => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('code');
});
