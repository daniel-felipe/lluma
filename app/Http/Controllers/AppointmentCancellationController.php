<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CancelAppointment;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class AppointmentCancellationController
{
    /**
     * Barber-initiated cancellation from the daily/weekly agenda.
     */
    public function __invoke(Request $request, Appointment $appointment): RedirectResponse
    {
        abort_if($request->user()?->barberProfile?->id !== $appointment->barber_profile_id, 403);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            resolve(CancelAppointment::class)->run($appointment, 'barber', $validated['reason'] ?? null);
        } catch (InvalidArgumentException $invalidArgumentException) {
            throw ValidationException::withMessages(['appointment' => $invalidArgumentException->getMessage()]);
        }

        return back();
    }
}
