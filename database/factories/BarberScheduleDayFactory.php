<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BarberScheduleDay>
 */
final class BarberScheduleDayFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'day_of_week'     => fake()->numberBetween(1, 7),
            'is_open'         => false,
            'opens_at'        => null,
            'closes_at'       => null,
            'break_starts_at' => null,
            'break_ends_at'   => null,
        ];
    }

    public function open(): self
    {
        return $this->state(fn (array $attributes): array => [
            'is_open'   => true,
            'opens_at'  => '09:00:00',
            'closes_at' => '19:00:00',
        ]);
    }

    public function closed(): self
    {
        return $this->state(fn (array $attributes): array => [
            'is_open'   => false,
            'opens_at'  => null,
            'closes_at' => null,
        ]);
    }

    public function withBreak(string $startsAt = '12:00:00', string $endsAt = '13:00:00'): self
    {
        return $this->state(fn (array $attributes): array => [
            'break_starts_at' => $startsAt,
            'break_ends_at'   => $endsAt,
        ]);
    }

    public function forSchedule(BarberSchedule $schedule): self
    {
        return $this->state(fn (array $attributes): array => [
            'barber_schedule_id' => $schedule->id,
        ]);
    }
}
