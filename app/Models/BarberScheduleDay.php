<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\BarberScheduleDayFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read string $id
 * @property-read string $barber_schedule_id
 * @property-read int $day_of_week
 * @property-read bool $is_open
 * @property-read string|null $opens_at
 * @property-read string|null $closes_at
 * @property-read string|null $break_starts_at
 * @property-read string|null $break_ends_at
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
final class BarberScheduleDay extends Model
{
    /** @use HasFactory<BarberScheduleDayFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'is_open'         => 'boolean',
            'opens_at'        => 'string',
            'closes_at'       => 'string',
            'break_starts_at' => 'string',
            'break_ends_at'   => 'string',
        ];
    }

    /** @return BelongsTo<BarberSchedule, $this> */
    public function barberSchedule(): BelongsTo
    {
        return $this->belongsTo(BarberSchedule::class);
    }
}
