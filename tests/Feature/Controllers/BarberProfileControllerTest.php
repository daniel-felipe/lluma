<?php

declare(strict_types = 1);

use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('renders profile page with correct props', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->get(route('onboarding.profile.edit'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/profile')
            ->has('barber')
            ->has('profile')
            ->has('onboarding_step')
            ->has('steps'));
});

it('updates barber profile and redirects to next step', function (): void {
    Storage::fake('public');
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João da Silva',
        'business_name'        => 'Barbearia do João',
        'slug'                 => 'barbearia-do-joao',
        'address_street'       => 'Rua das Flores',
        'address_number'       => '123',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'Belo Horizonte',
        'address_state'        => 'MG',
    ]);

    $response->assertRedirect();

    $profile = BarberProfile::query()->where('user_id', $user->id)->first();
    expect($profile->onboarding_step)->toBe(BarberOnboardingStep::Services)
        ->and($profile->business_name)->toBe('Barbearia do João');
});

it('returns validation errors for missing required fields', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), []);

    $response->assertSessionHasErrors(['name', 'business_name', 'slug', 'address_street']);
});

it('validates slug uniqueness without error when user has no barber profile', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'taken-slug']);

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João',
        'business_name'        => 'Barbearia',
        'slug'                 => 'taken-slug',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'B',
        'address_city'         => 'C',
        'address_state'        => 'MG',
    ]);

    $response->assertSessionHasErrors('slug');
});

it('returns validation error for duplicate slug', function (): void {
    Storage::fake('public');
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'taken-slug']);
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João',
        'business_name'        => 'Barbearia',
        'slug'                 => 'taken-slug',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'B',
        'address_city'         => 'C',
        'address_state'        => 'MG',
    ]);

    $response->assertSessionHasErrors('slug');
});

it('returns validation error for oversized photo', function (): void {
    Storage::fake('public');
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João',
        'business_name'        => 'Barbearia do João',
        'slug'                 => 'barbearia-do-joao',
        'address_street'       => 'Rua das Flores',
        'address_number'       => '123',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'Belo Horizonte',
        'address_state'        => 'MG',
        'profile_photo'        => UploadedFile::fake()->image('photo.jpg')->size(6000),
    ]);

    $response->assertSessionHasErrors('profile_photo');
});

it('redirects unauthenticated request to login', function (): void {
    $response = $this->get(route('onboarding.profile.edit'));

    $response->assertRedirectToRoute('login');
});

it('renders profile edit page with null profile when user has no barber profile', function (): void {
    $user = User::factory()->phoneVerified()->create();

    $response = $this->actingAs($user)->get(route('onboarding.profile.edit'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/profile')
            ->where('profile', null));
});

it('saves optional phone to user when provided', function (): void {
    Storage::fake('public');
    $user = User::factory()->create(['phone' => null]);
    BarberProfile::factory()->for($user)->draft()->create();

    $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João da Silva',
        'business_name'        => 'Barbearia do João',
        'slug'                 => 'barbearia-do-joao',
        'address_street'       => 'Rua das Flores',
        'address_number'       => '123',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'Belo Horizonte',
        'address_state'        => 'MG',
        'phone'                => '+5531999990000',
    ]);

    expect($user->fresh()->phone)->toBe('+5531999990000');
});

it('rejects invalid phone format', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->draft()->create();

    $response = $this->actingAs($user)->post(route('onboarding.profile.update'), [
        'name'                 => 'João da Silva',
        'business_name'        => 'Barbearia do João',
        'slug'                 => 'barbearia-do-joao',
        'address_street'       => 'Rua das Flores',
        'address_number'       => '123',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'Belo Horizonte',
        'address_state'        => 'MG',
        'phone'                => '31999990000',
    ]);

    $response->assertSessionHasErrors('phone');
});
