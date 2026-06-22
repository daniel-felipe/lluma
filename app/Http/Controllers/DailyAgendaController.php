<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DailyAgendaController
{
    public function __invoke(Request $request): Response
    {
        $barberProfile = $request->user()?->barberProfile;

        abort_if($barberProfile === null, 404);

        $appointments = Appointment::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->whereDate('starts_at', today())
            ->whereIn('status', [
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::Completed->value,
                AppointmentStatus::NoShow->value,
            ])
            ->with('service')
            ->orderBy('starts_at')
            ->get();

        $completedRevenue = $appointments
            ->where('status', AppointmentStatus::Completed)
            ->sum(fn (Appointment $appointment): int => $appointment->service->price_cents);

        return Inertia::render('agenda/daily', [
            'appointments' => $appointments->map(fn (Appointment $appointment): array => [
                'id'           => $appointment->id,
                'client_name'  => $appointment->client_name,
                'client_phone' => $appointment->client_phone,
                'starts_at'    => $appointment->starts_at->toIso8601String(),
                'ends_at'      => $appointment->ends_at->toIso8601String(),
                'status'       => $appointment->status->value,
                'service'      => [
                    'name'        => $appointment->service->name,
                    'price_cents' => $appointment->service->price_cents,
                ],
            ]),
            'metrics' => [
                'total_booked'            => $appointments->count(),
                'completed'               => $appointments->where('status', AppointmentStatus::Completed)->count(),
                'completed_revenue_cents' => $completedRevenue,
            ],
            'services' => $barberProfile->services()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Service $service): array => [
                    'id'               => $service->id,
                    'name'             => $service->name,
                    'price_cents'      => $service->price_cents,
                    'duration_minutes' => $service->duration_minutes,
                ]),
        ]);
    }
}
