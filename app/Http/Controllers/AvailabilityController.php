<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\GetAvailableSlots;
use App\Http\Requests\GetAvailableSlotsRequest;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use App\ValueObjects\AvailabilitySlot;
use DateTimeImmutable;
use Illuminate\Http\JsonResponse;

final readonly class AvailabilityController
{
    public function __invoke(GetAvailableSlotsRequest $request, BarberProfile $barberProfile): JsonResponse
    {
        $service = Service::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->where('id', $request->input('service_id'))
            ->where('is_active', true)
            ->first();

        if ($service === null) {
            return response()->json(['message' => 'Service not found for this barber.'], 422);
        }

        $schedule = $barberProfile->schedule()->with('days')->first();

        if ($schedule === null) {
            return response()->json(['slots' => []]);
        }

        $date = new DateTimeImmutable($request->input('date'));

        // Load only active (non-expired) appointments for conflict detection in a single query
        $appointments = Appointment::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->whereDate('starts_at', $date->format('Y-m-d'))
            ->confirmedOrPending()
            ->get();

        $slots = $this->getAvailableSlots->run($schedule, $service->duration_minutes, $date, $appointments);

        $slotTimes = array_map(fn (AvailabilitySlot $slot): string => $slot->startsAt->format('H:i'), $slots);

        return response()->json(['slots' => $slotTimes]);
    }

    public function __construct(private GetAvailableSlots $getAvailableSlots) {}
}
