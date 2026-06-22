<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<SmsVerification>
 */
final class SmsVerificationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'phone'         => '+55' . fake()->numerify('##9########'),
            'code'          => Hash::make('123456'),
            'purpose'       => SmsVerificationPurpose::Registration,
            'expires_at'    => now()->addMinutes(10),
            'verified_at'   => null,
            'attempt_count' => 0,
        ];
    }

    public function expired(): self
    {
        return $this->state(fn (array $attributes): array => [
            'expires_at' => now()->subMinutes(10),
        ]);
    }

    public function verified(): self
    {
        return $this->state(fn (array $attributes): array => [
            'verified_at' => now(),
        ]);
    }

    public function exhausted(): self
    {
        return $this->state(fn (array $attributes): array => [
            'attempt_count' => 5,
        ]);
    }

    public function forRegistration(): self
    {
        return $this->state(fn (array $attributes): array => [
            'purpose' => SmsVerificationPurpose::Registration,
        ]);
    }

    public function forPasswordReset(): self
    {
        return $this->state(fn (array $attributes): array => [
            'purpose' => SmsVerificationPurpose::PasswordReset,
        ]);
    }
}
