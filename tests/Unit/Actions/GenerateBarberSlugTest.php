<?php

declare(strict_types = 1);

use App\Actions\GenerateBarberSlug;
use App\Models\BarberProfile;
use App\Models\User;

it('converts business name to slug', function (): void {
    $action = resolve(GenerateBarberSlug::class);

    expect($action->run('Barbearia do Lucas'))->toBe('barbearia-do-lucas');
});

it('strips accents from business name', function (): void {
    $action = resolve(GenerateBarberSlug::class);

    expect($action->run('João e Maria'))->toBe('joao-e-maria');
});

it('appends -2 suffix for slug collision', function (): void {
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'barbearia-top']);

    $action = resolve(GenerateBarberSlug::class);

    expect($action->run('Barbearia Top'))->toBe('barbearia-top-2');
});

it('appends -3 suffix for second collision', function (): void {
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'barbearia-top']);
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'barbearia-top-2']);

    $action = resolve(GenerateBarberSlug::class);

    expect($action->run('Barbearia Top'))->toBe('barbearia-top-3');
});

it('skips own slug when except param provided', function (): void {
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'my-barber']);

    $action = resolve(GenerateBarberSlug::class);

    expect($action->run('My Barber', 'my-barber'))->toBe('my-barber');
});

it('truncates slug to at most 50 characters', function (): void {
    $action   = resolve(GenerateBarberSlug::class);
    $longName = str_repeat('a', 60);
    $slug     = $action->run($longName);

    expect(mb_strlen($slug))->toBeLessThanOrEqual(50);
});
