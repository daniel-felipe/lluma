<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Enums\BarberProfileStatus;
use App\Models\BarberProfile;
use App\Models\Service;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Inertia\Inertia;
use Inertia\Response;

final class BarberPublicProfileController
{
    public function __invoke(BarberProfile $barberProfile): Response
    {
        abort_unless($barberProfile->status === BarberProfileStatus::Published, 404);

        // Basic link analytics (F9) — count every public page visit
        $barberProfile->increment('link_visits');

        $barberProfile->load([
            'services' => fn (HasMany $query) => $query->where('is_active', true)->orderBy('sort_order'),
            'schedule.days',
        ]);

        $openDays = $barberProfile->schedule
            ?->days
            ->where('is_open', true)
            ->pluck('day_of_week')
            ->values()
            ->all() ?? [];

        return Inertia::render('booking/show', [
            'barber' => [
                'slug'              => $barberProfile->slug,
                'business_name'     => $barberProfile->business_name,
                'profile_photo_url' => $barberProfile->profile_photo_url,
                'cover_photo_url'   => $barberProfile->cover_photo_url,
                'address'           => sprintf(
                    '%s, %s — %s, %s/%s',
                    $barberProfile->address_street,
                    $barberProfile->address_number,
                    $barberProfile->address_neighborhood,
                    $barberProfile->address_city,
                    $barberProfile->address_state,
                ),
            ],
            'services' => $barberProfile->services->map(fn (Service $service): array => [
                'id'               => $service->id,
                'name'             => $service->name,
                'price_cents'      => $service->price_cents,
                'duration_minutes' => $service->duration_minutes,
            ]),
            'open_days' => $openDays,
        ]);
    }
}
