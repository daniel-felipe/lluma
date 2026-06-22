<?php

declare(strict_types = 1);

use App\Actions\UpdateBarberProfile;
use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('creates barber profile on first call', function (): void {
    $user = User::factory()->create();

    $action  = resolve(UpdateBarberProfile::class);
    $profile = $action->run($user, [
        'name'                 => 'João',
        'business_name'        => 'Barbearia do João',
        'slug'                 => 'barbearia-do-joao',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'BH',
        'address_state'        => 'MG',
    ], null, null);

    expect(BarberProfile::query()->where('user_id', $user->id)->exists())->toBeTrue()
        ->and($profile->business_name)->toBe('Barbearia do João');
});

it('updates existing profile on second call', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->draft()->create();

    $action  = resolve(UpdateBarberProfile::class);
    $profile = $action->run($user, [
        'name'                 => 'João',
        'business_name'        => 'Novo Nome',
        'slug'                 => 'novo-slug',
        'address_street'       => 'Rua B',
        'address_number'       => '2',
        'address_neighborhood' => 'Bairro',
        'address_city'         => 'SP',
        'address_state'        => 'SP',
    ], null, null);

    expect(BarberProfile::query()->where('user_id', $user->id)->count())->toBe(1)
        ->and($profile->business_name)->toBe('Novo Nome');
});

it('stores profile photo when provided', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();

    $action = resolve(UpdateBarberProfile::class);
    $photo  = UploadedFile::fake()->image('photo.jpg');

    $profile = $action->run($user, [
        'name'                 => 'João',
        'business_name'        => 'Barbearia',
        'slug'                 => 'barbearia',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'BH',
        'address_state'        => 'MG',
    ], $photo, null);

    expect($profile->profile_photo_url)->not->toBeNull();
    Storage::disk('public')->assertExists($profile->profile_photo_url);
});

it('stores cover photo when provided', function (): void {
    Storage::fake('public');
    $user = User::factory()->create();

    $action = resolve(UpdateBarberProfile::class);
    $cover  = UploadedFile::fake()->image('cover.jpg');

    $profile = $action->run($user, [
        'name'                 => 'João',
        'business_name'        => 'Barbearia',
        'slug'                 => 'barbearia',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'BH',
        'address_state'        => 'MG',
    ], null, $cover);

    expect($profile->cover_photo_url)->not->toBeNull();
    Storage::disk('public')->assertExists($profile->cover_photo_url);
});

it('sets onboarding_step to services', function (): void {
    $user = User::factory()->create();

    $action  = resolve(UpdateBarberProfile::class);
    $profile = $action->run($user, [
        'name'                 => 'João',
        'business_name'        => 'Barbearia',
        'slug'                 => 'barbearia',
        'address_street'       => 'Rua A',
        'address_number'       => '1',
        'address_neighborhood' => 'Centro',
        'address_city'         => 'BH',
        'address_state'        => 'MG',
    ], null, null);

    expect($profile->onboarding_step)->toBe(BarberOnboardingStep::Services);
});
