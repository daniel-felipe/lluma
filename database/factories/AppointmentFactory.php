<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
final class AppointmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+30 days');
        $duration = 30;

        return [
            'barber_profile_id' => BarberProfile::factory(),
            'service_id'        => Service::factory(),
            'client_name'       => fake()->name(),
            'client_phone'      => fake()->numerify('(##) #####-####'),
            'starts_at'         => $startsAt,
            'ends_at'           => (clone $startsAt)->modify(sprintf('+%d minutes', $duration)),
            'status'            => AppointmentStatus::Confirmed,
            'locked_until'      => null,
        ];
    }

    public function pending(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'       => AppointmentStatus::Pending,
            'locked_until' => now()->addMinutes(5),
        ]);
    }

    public function confirmed(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'       => AppointmentStatus::Confirmed,
            'locked_until' => null,
        ]);
    }

    public function completed(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'       => AppointmentStatus::Completed,
            'locked_until' => null,
        ]);
    }

    public function noShow(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'       => AppointmentStatus::NoShow,
            'locked_until' => null,
        ]);
    }

    public function cancelled(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'              => AppointmentStatus::Cancelled,
            'locked_until'        => null,
            'cancellation_reason' => fake()->sentence(),
            'cancelled_by'        => fake()->randomElement(['client', 'barber']),
        ]);
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'       => AppointmentStatus::Pending,
            'locked_until' => now()->subMinutes(5),
        ]);
    }
}
