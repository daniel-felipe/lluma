<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\BarberScheduleFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read string $id
 * @property-read string $barber_profile_id
 * @property-read int $buffer_minutes
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 * @property-read BarberProfile $barberProfile
 */
final class BarberSchedule extends Model
{
    /** @use HasFactory<BarberScheduleFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'buffer_minutes' => 'integer',
        ];
    }

    /** @return BelongsTo<BarberProfile, $this> */
    public function barberProfile(): BelongsTo
    {
        return $this->belongsTo(BarberProfile::class);
    }

    /** @return HasMany<BarberScheduleDay, $this> */
    public function days(): HasMany
    {
        return $this->hasMany(BarberScheduleDay::class);
    }
}
