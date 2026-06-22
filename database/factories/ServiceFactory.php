<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\BarberProfile;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
final class ServiceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'             => fake()->words(nb: 2, asText: true),
            'price_cents'      => fake()->numberBetween(2000, 10000),
            'duration_minutes' => fake()->numberBetween(15, 90),
            'is_active'        => true,
            'sort_order'       => 0,
        ];
    }

    public function active(): self
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => true,
        ]);
    }

    public function inactive(): self
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    public function forProfile(BarberProfile $profile): self
    {
        return $this->state(fn (array $attributes): array => [
            'barber_profile_id' => $profile->id,
        ]);
    }
}
