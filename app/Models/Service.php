<?php

declare(strict_types = 1);

namespace App\Models;

use App\Enums\AppointmentStatus;
use Carbon\CarbonInterface;
use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read string $id
 * @property-read string $barber_profile_id
 * @property-read string $name
 * @property-read int $price_cents
 * @property-read int $duration_minutes
 * @property-read bool $is_active
 * @property-read int $sort_order
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
#[Fillable([
    'barber_profile_id',
    'name',
    'price_cents',
    'duration_minutes',
    'is_active',
    'sort_order',
])]
final class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'price_cents'      => 'integer',
            'duration_minutes' => 'integer',
            'is_active'        => 'boolean',
            'sort_order'       => 'integer',
        ];
    }

    /** @return BelongsTo<BarberProfile, $this> */
    public function barberProfile(): BelongsTo
    {
        return $this->belongsTo(BarberProfile::class);
    }

    // F5 — stub relationship; full implementation in feature F5
    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @param Builder<Service> $query */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<Service> $query */
    #[Scope]
    protected function ordered(Builder $query): void
    {
        $query->orderBy('sort_order');
    }

    public function futureAppointmentsCount(): int
    {
        return $this->appointments()
            ->whereIn('status', [AppointmentStatus::Confirmed->value, AppointmentStatus::Pending->value])
            ->where('starts_at', '>', now())
            ->count();
    }
}
