<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BarberProfile>
 */
final class BarberProfileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessName = fake()->company();

        return [
            'business_name'        => $businessName,
            'slug'                 => Str::slug($businessName) . '-' . fake()->unique()->numberBetween(1, 9999),
            'address_street'       => fake()->streetName(),
            'address_number'       => (string) fake()->numberBetween(1, 9999),
            'address_neighborhood' => fake()->word(),
            'address_city'         => fake()->city(),
            'address_state'        => mb_strtoupper(fake()->lexify('??')),
            'address_cep'          => null,
            'profile_photo_url'    => null,
            'cover_photo_url'      => null,
            'status'               => BarberProfileStatus::Draft,
            'onboarding_step'      => BarberOnboardingStep::Profile,
        ];
    }

    public function published(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'          => BarberProfileStatus::Published,
            'onboarding_step' => BarberOnboardingStep::Complete,
        ]);
    }

    public function draft(): self
    {
        return $this->state(fn (array $attributes): array => [
            'status'          => BarberProfileStatus::Draft,
            'onboarding_step' => BarberOnboardingStep::Profile,
        ]);
    }

    public function withPhotos(): self
    {
        return $this->state(fn (array $attributes): array => [
            'profile_photo_url' => 'barbers/photos/profile.jpg',
            'cover_photo_url'   => 'barbers/photos/cover.jpg',
        ]);
    }
}
