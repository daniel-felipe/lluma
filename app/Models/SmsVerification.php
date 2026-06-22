<?php

declare(strict_types = 1);

namespace App\Models;

use App\Enums\SmsVerificationPurpose;
use Carbon\CarbonInterface;
use Database\Factories\SmsVerificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read string $id
 * @property-read string $phone
 * @property-read string $code
 * @property-read SmsVerificationPurpose $purpose
 * @property-read CarbonInterface $expires_at
 * @property-read CarbonInterface|null $verified_at
 * @property-read int $attempt_count
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
#[Fillable([
    'phone',
    'code',
    'purpose',
    'expires_at',
    'verified_at',
    'attempt_count',
])]
final class SmsVerification extends Model
{
    /** @use HasFactory<SmsVerificationFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'purpose'       => SmsVerificationPurpose::class,
            'expires_at'    => 'datetime',
            'verified_at'   => 'datetime',
            'attempt_count' => 'integer',
        ];
    }

    /** @param Builder<SmsVerification> $query */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->whereNull('verified_at')->where('expires_at', '>', now());
    }

    /** @param Builder<SmsVerification> $query */
    #[Scope]
    protected function forPhone(Builder $query, string $phone): void
    {
        $query->where('phone', $phone);
    }

    /** @param Builder<SmsVerification> $query */
    #[Scope]
    protected function forPurpose(Builder $query, SmsVerificationPurpose $purpose): void
    {
        $query->where('purpose', $purpose->value);
    }
}
