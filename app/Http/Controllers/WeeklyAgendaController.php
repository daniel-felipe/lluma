<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

final class WeeklyAgendaController
{
    public function __invoke(Request $request): Response
    {
        $barberProfile = $request->user()?->barberProfile;

        abort_if($barberProfile === null, 404);

        $request->validate([
            'start' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $startInput = $request->input('start');
        $weekStart  = ($startInput !== null ? Date::parse($startInput) : now())->startOfWeek(Carbon::MONDAY)->startOfDay();
        $weekEnd    = $weekStart->copy()->addDays(7);

        $appointments = Appointment::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->where('starts_at', '>=', $weekStart)
            ->where('starts_at', '<', $weekEnd)
            ->whereIn('status', [
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::Completed->value,
                AppointmentStatus::NoShow->value,
            ])
            ->with('service')
            ->orderBy('starts_at')
            ->get();

        $schedule = $barberProfile->schedule()->with('days')->first();

        $openDays = $schedule?->days->where('is_open', true) ?? collect();

        return Inertia::render('agenda/weekly', [
            'week_start'   => $weekStart->format('Y-m-d'),
            'opens_at'     => $openDays->min('opens_at') ?? '08:00:00',
            'closes_at'    => $openDays->max('closes_at') ?? '20:00:00',
            'appointments' => $appointments->map(fn (Appointment $appointment): array => [
                'id'          => $appointment->id,
                'client_name' => $appointment->client_name,
                'starts_at'   => $appointment->starts_at->toIso8601String(),
                'ends_at'     => $appointment->ends_at->toIso8601String(),
                'status'      => $appointment->status->value,
                'service'     => [
                    'name'        => $appointment->service->name,
                    'price_cents' => $appointment->service->price_cents,
                ],
            ]),
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
