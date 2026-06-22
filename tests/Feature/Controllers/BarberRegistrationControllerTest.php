<?php

declare(strict_types = 1);

use App\Models\SmsVerification;
use App\Models\User;

it('renders phone registration page', function (): void {
    $response = $this->get(route('register'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('onboarding/phone'));
});

it('redirects authenticated users away from register', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('register'));

    $response->assertRedirect(route('dashboard'));
});

it('stores phone and sends sms on valid registration', function (): void {
    $response = $this->post(route('register.store'), [
        'phone' => '(31) 99999-0000',
    ]);

    $response->assertRedirectToRoute('register.verify');

    expect(SmsVerification::query()->count())->toBe(1)
        ->and(SmsVerification::query()->first()->phone)->toBe('+5531999990000');
});

it('returns error when phone is already registered', function (): void {
    User::factory()->create(['phone' => '+5531999990000']);

    $response = $this->post(route('register.store'), [
        'phone' => '(31) 99999-0000',
    ]);

    $response->assertSessionHasErrors('phone');
});

it('returns validation error for invalid phone format', function (): void {
    $response = $this->post(route('register.store'), [
        'phone' => 'not-a-phone',
    ]);

    $response->assertSessionHasErrors('phone');
});

it('returns validation error for missing phone', function (): void {
    $response = $this->post(route('register.store'), []);

    $response->assertSessionHasErrors('phone');
});

it('rate limits registration after 5 attempts per minute', function (): void {
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('register.store'), ['phone' => sprintf('(31) 9999%d-0000', $i)]);
    }

    $response = $this->post(route('register.store'), ['phone' => '(31) 91111-1111']);

    $response->assertStatus(429);
});
