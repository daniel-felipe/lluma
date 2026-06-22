<?php

declare(strict_types = 1);

use App\Models\BarberProfile;
use App\Models\User;

it('returns available true for a free slug', function (): void {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson(route('slug.available', ['slug' => 'free-slug']));

    $response->assertOk()
        ->assertJson(['available' => true, 'suggestion' => 'free-slug']);
});

it('returns available false with suggestion for a taken slug', function (): void {
    BarberProfile::factory()->for(User::factory()->create())->create(['slug' => 'taken-slug']);
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson(route('slug.available', ['slug' => 'taken-slug']));

    $response->assertOk()
        ->assertJsonPath('available', false);
});

it('returns available true for own slug with except param', function (): void {
    $user = User::factory()->create();
    BarberProfile::factory()->for($user)->create(['slug' => 'my-slug']);

    $response = $this->actingAs($user)
        ->getJson(route('slug.available', ['slug' => 'my-slug', 'except' => 'my-slug']));

    $response->assertOk()
        ->assertJson(['available' => true]);
});

it('returns 401 for unauthenticated request', function (): void {
    $response = $this->getJson(route('slug.available', ['slug' => 'test']));

    $response->assertStatus(401);
});

it('rate limits after 30 requests per minute', function (): void {
    $user = User::factory()->create();

    for ($i = 0; $i < 30; $i++) {
        $this->actingAs($user)->getJson(route('slug.available', ['slug' => 'slug-' . $i]));
    }

    $response = $this->actingAs($user)
        ->getJson(route('slug.available', ['slug' => 'slug-31']));

    $response->assertStatus(429);
});
