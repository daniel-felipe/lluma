<?php

declare(strict_types = 1);

namespace App\Models;

use App\Enums\AppointmentStatus;
use Carbon\CarbonInterface;
use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read string $id
 * @property-read string $barber_profile_id
 * @property-read string $service_id
 * @property-read string $client_name
 * @property-read string $client_phone
 * @property-read CarbonInterface $starts_at
 * @property-read CarbonInterface $ends_at
 * @property-read AppointmentStatus $status
 * @property-read CarbonInterface|null $locked_until
 * @property-read CarbonInterface|null $reminder_sent_at
 * @property-read string|null $cancellation_reason
 * @property-read string|null $cancelled_by
 * @property-read bool $cancelled_late
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
#[Fillable([
    'barber_profile_id',
    'service_id',
    'client_name',
    'client_phone',
    'starts_at',
    'ends_at',
    'status',
    'locked_until',
    'reminder_sent_at',
    'cancellation_reason',
    'cancelled_by',
    'cancelled_late',
])]
final class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'starts_at'        => 'datetime',
            'ends_at'          => 'datetime',
            'locked_until'     => 'datetime',
            'reminder_sent_at' => 'datetime',
            'cancelled_late'   => 'boolean',
            'status'           => AppointmentStatus::class,
        ];
    }

    /** @return BelongsTo<BarberProfile, $this> */
    public function barberProfile(): BelongsTo
    {
        return $this->belongsTo(BarberProfile::class);
    }

    /** @return BelongsTo<Service, $this> */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** @param Builder<Appointment> $query */
    #[Scope]
    protected function activeLocks(Builder $query): void
    {
        $query->where('status', AppointmentStatus::Pending->value)
            ->where('locked_until', '>', now());
    }

    /** @param Builder<Appointment> $query */
    #[Scope]
    protected function confirmedOrPending(Builder $query): void
    {
        $query->where(function (Builder $query): void {
            $query->where('status', AppointmentStatus::Confirmed->value)
                ->orWhere(function (Builder $query): void {
                    $query->where('status', AppointmentStatus::Pending->value)
                        ->where('locked_until', '>', now());
                });
        });
    }
}
