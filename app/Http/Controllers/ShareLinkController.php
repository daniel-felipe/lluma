<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ShareLinkController
{
    public function __invoke(Request $request): Response
    {
        $barberProfile = $request->user()?->barberProfile;

        abort_if($barberProfile === null, 404);

        $bookings = $barberProfile->appointments()
            ->whereIn('status', [
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::Completed->value,
                AppointmentStatus::NoShow->value,
            ])
            ->count();

        $visits = $barberProfile->link_visits;

        return Inertia::render('share/show', [
            'public_url' => route('barbers.show', $barberProfile),
            'analytics'  => [
                'visits'          => $visits,
                'bookings'        => $bookings,
                'conversion_rate' => $visits > 0 ? round($bookings / $visits * 100, 1) : 0,
            ],
        ]);
    }
}
