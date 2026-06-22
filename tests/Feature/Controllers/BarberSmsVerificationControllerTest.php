<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Enums\SmsVerificationPurpose;
use App\Models\BarberProfile;
use App\Models\SmsVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('renders verify page with masked phone from session', function (): void {
    $response = $this->withSession(['registration_phone' => '+5531999990000'])
        ->get(route('register.verify'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/verify')
            ->where('phone', '(31) 9****-0000'));
});

it('redirects to register if no phone in session', function (): void {
    $response = $this->get(route('register.verify'));

    $response->assertRedirectToRoute('register');
});

it('verifies code, creates user and barber profile, and logs in', function (): void {
    SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '123456',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

    $response->assertRedirectToRoute('onboarding.profile.edit');

    $user = User::query()->where('phone', '+5531999990000')->first();
    expect($user)->not->toBeNull()
        ->and($user->phone_verified_at)->not->toBeNull();

    $profile = BarberProfile::query()->where('user_id', $user->id)->first();
    expect($profile)->not->toBeNull()
        ->and($profile->status)->toBe(BarberProfileStatus::Draft)
        ->and($profile->onboarding_step)->toBe(BarberOnboardingStep::Profile);

    $this->assertAuthenticatedAs($user);
});

it('returns error for wrong code and increments attempt count', function (): void {
    $verification = SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '000000',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('code');

    expect($verification->fresh()->attempt_count)->toBe(1);
});

it('returns error for expired code', function (): void {
    SmsVerification::factory()->expired()->create([
        'phone'   => '+5531999990000',
        'code'    => Hash::make('123456'),
        'purpose' => SmsVerificationPurpose::Registration,
    ]);

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '123456',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('code');
});

it('returns error for exhausted verification attempts', function (): void {
    SmsVerification::factory()->exhausted()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '123456',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('code');
});

it('returns 429 when resending within cooldown period', function (): void {
    SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.resend'))
        ->assertStatus(429);
});

it('allows resend after cooldown and creates new verification', function (): void {
    $old = SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
        'created_at' => now()->subSeconds(61),
    ]);

    $countBefore = SmsVerification::query()->count();

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.resend'))
        ->assertRedirect();

    expect(SmsVerification::query()->count())->toBe($countBefore + 1);
});

it('renders verify page with resendAvailableAt when a verification exists', function (): void {
    SmsVerification::factory()->create([
        'phone'   => '+5531999990000',
        'purpose' => SmsVerificationPurpose::Registration,
    ]);

    $response = $this->withSession(['registration_phone' => '+5531999990000'])
        ->get(route('register.verify'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/verify')
            ->whereNot('resendAvailableAt', null));
});

it('redirects to register when no session phone on store', function (): void {
    $response = $this->post(route('register.verify.store'), [
        'code'                  => '123456',
        'password'              => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirectToRoute('register');
});

it('redirects to register when no session phone on resend', function (): void {
    $response = $this->post(route('register.resend'));

    $response->assertRedirectToRoute('register');
});

it('returns error when code is invalid during verification', function (): void {
    SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '000000',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('code');
});

it('returns error when no active verification code exists on store', function (): void {
    $this->withSession(['registration_phone' => '+5531999990000'])
        ->post(route('register.verify.store'), [
            'code'                  => '123456',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertSessionHasErrors('code');
});
