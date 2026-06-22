<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\UpdateAppointmentStatus;
use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class AppointmentStatusController
{
    public function __invoke(Request $request, Appointment $appointment): RedirectResponse
    {
        abort_if($request->user()?->barberProfile?->id !== $appointment->barber_profile_id, 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in([AppointmentStatus::Completed->value, AppointmentStatus::NoShow->value])],
        ]);

        try {
            resolve(UpdateAppointmentStatus::class)->run(
                $appointment,
                AppointmentStatus::from($validated['status']),
            );
        } catch (InvalidArgumentException $invalidArgumentException) {
            throw ValidationException::withMessages(['status' => $invalidArgumentException->getMessage()]);
        }

        return back();
    }
}
