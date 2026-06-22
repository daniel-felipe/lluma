<?php

declare(strict_types = 1);

namespace App\Models;

use App\Enums\BarberOnboardingStep;
use App\Enums\BarberProfileStatus;
use Carbon\CarbonInterface;
use Database\Factories\BarberProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property-read string $id
 * @property-read string $user_id
 * @property-read string $business_name
 * @property-read string $slug
 * @property-read string $address_street
 * @property-read string $address_number
 * @property-read string $address_neighborhood
 * @property-read string $address_city
 * @property-read string $address_state
 * @property-read string|null $address_cep
 * @property-read string|null $profile_photo_url
 * @property-read string|null $cover_photo_url
 * @property-read BarberProfileStatus $status
 * @property-read BarberOnboardingStep $onboarding_step
 * @property-read int $link_visits
 * @property-read CarbonInterface $created_at
 * @property-read CarbonInterface $updated_at
 */
#[Fillable([
    'user_id',
    'business_name',
    'slug',
    'address_street',
    'address_number',
    'address_neighborhood',
    'address_city',
    'address_state',
    'address_cep',
    'profile_photo_url',
    'cover_photo_url',
    'status',
    'onboarding_step',
    'link_visits',
])]
final class BarberProfile extends Model
{
    /** @use HasFactory<BarberProfileFactory> */
    use HasFactory;

    use HasUuids;

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'status'          => BarberProfileStatus::class,
            'onboarding_step' => BarberOnboardingStep::class,
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // F2 — stub relationship for PublishBarberProfile action
    /** @return HasMany<Service, $this> */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /** @return HasOne<BarberSchedule, $this> */
    public function schedule(): HasOne
    {
        return $this->hasOne(BarberSchedule::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @param Builder<BarberProfile> $query */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', BarberProfileStatus::Published->value);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
