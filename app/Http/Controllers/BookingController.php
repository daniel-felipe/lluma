<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CreateBooking;
use App\Enums\AppointmentStatus;
use App\Enums\BarberProfileStatus;
use App\Exceptions\DuplicateBookingException;
use App\Exceptions\SlotUnavailableException;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Date;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class BookingController
{
    public function store(StoreBookingRequest $request, BarberProfile $barberProfile): RedirectResponse
    {
        abort_unless($barberProfile->status === BarberProfileStatus::Published, 404);

        $service = Service::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->where('id', $request->string('service_id')->value())
            ->where('is_active', true)
            ->first();

        if ($service === null) {
            throw ValidationException::withMessages([
                'service_id' => 'Service not found for this barber.',
            ]);
        }

        $startsAt = Date::parse($request->string('date')->value() . ' ' . $request->string('time')->value());

        if ($startsAt->isPast()) {
            throw ValidationException::withMessages([
                'time' => 'This time is in the past.',
            ]);
        }

        try {
            $appointment = resolve(CreateBooking::class)->run(
                $barberProfile,
                $service,
                $startsAt,
                $request->string('client_name')->value(),
                $request->string('client_phone')->value(),
            );
        } catch (SlotUnavailableException $exception) {
            throw ValidationException::withMessages(['time' => $exception->getMessage()]);
        } catch (DuplicateBookingException $exception) {
            throw ValidationException::withMessages(['client_phone' => $exception->getMessage()]);
        }

        return to_route('bookings.show', $appointment);
    }

    public function show(Appointment $appointment): Response
    {
        $appointment->load(['barberProfile', 'service']);

        $barberProfile = $appointment->barberProfile;

        return Inertia::render('booking/confirmation', [
            'appointment' => [
                'id'          => $appointment->id,
                'client_name' => $appointment->client_name,
                'starts_at'   => $appointment->starts_at->toIso8601String(),
                'status'      => $appointment->status->value,
                'can_cancel'  => in_array($appointment->status, [AppointmentStatus::Pending, AppointmentStatus::Confirmed], true)
                    && $appointment->starts_at->isFuture(),
                'service' => [
                    'name'             => $appointment->service->name,
                    'price_cents'      => $appointment->service->price_cents,
                    'duration_minutes' => $appointment->service->duration_minutes,
                ],
                'barber' => [
                    'slug'          => $barberProfile->slug,
                    'business_name' => $barberProfile->business_name,
                    'address'       => sprintf(
                        '%s, %s — %s, %s/%s',
                        $barberProfile->address_street,
                        $barberProfile->address_number,
                        $barberProfile->address_neighborhood,
                        $barberProfile->address_city,
                        $barberProfile->address_state,
                    ),
                ],
            ],
        ]);
    }
}
