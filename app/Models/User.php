<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property-read string $id
 * @property-read string|null $name
 * @property-read string|null $email
 * @property-read CarbonInterface|null $email_verified_at
 * @property-read string|null $phone
 * @property-read CarbonInterface|null $phone_verified_at
 * @property-read string|null $google_id
 * @property-read string|null $password
 * @property-read string|null $remember_token
 * @property-read string|null $two_factor_secret
 * @property-read string|null $two_factor_recovery_codes
 * @property-read CarbonInterface|null $two_factor_confirmed_at
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
#[Hidden([
    'password',
    'remember_token',
    'two_factor_secret',
    'two_factor_recovery_codes',
])]
final class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasUuids;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id'                        => 'string',
            'google_id'                 => 'string',
            'name'                      => 'string',
            'email'                     => 'string',
            'email_verified_at'         => 'datetime',
            'phone'                     => 'string',
            'phone_verified_at'         => 'datetime',
            'password'                  => 'hashed',
            'remember_token'            => 'string',
            'two_factor_secret'         => 'string',
            'two_factor_recovery_codes' => 'string',
            'two_factor_confirmed_at'   => 'datetime',
            'created_at'                => 'datetime',
            'updated_at'                => 'datetime',
        ];
    }

    /** @return HasOne<BarberProfile, $this> */
    public function barberProfile(): HasOne
    {
        return $this->hasOne(BarberProfile::class);
    }
}
