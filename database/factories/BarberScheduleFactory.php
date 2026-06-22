<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberSchedule>
 */
final class BarberScheduleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'buffer_minutes' => 0,
        ];
    }

    public function withBuffer(int $minutes): self
    {
        return $this->state(fn (array $attributes): array => [
            'buffer_minutes' => $minutes,
        ]);
    }

    public function forProfile(BarberProfile $profile): self
    {
        return $this->state(fn (array $attributes): array => [
            'barber_profile_id' => $profile->id,
        ]);
    }
}
