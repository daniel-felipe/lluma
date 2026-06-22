<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CancelAppointment;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class BookingCancellationController
{
    /**
     * Client-initiated cancellation from the public confirmation page.
     * The unguessable appointment UUID acts as the access token.
     */
    public function __invoke(Request $request, Appointment $appointment): RedirectResponse
    {
        $validated = $request->validate([
            'reschedule' => ['nullable', 'boolean'],
        ]);

        try {
            resolve(CancelAppointment::class)->run($appointment, 'client');
        } catch (InvalidArgumentException $invalidArgumentException) {
            throw ValidationException::withMessages(['appointment' => $invalidArgumentException->getMessage()]);
        }

        // Rescheduling = cancel + rebook with the same service preselected
        if ($validated['reschedule'] ?? false) {
            return to_route('barbers.show', [
                'barberProfile' => $appointment->barberProfile,
                'service'       => $appointment->service_id,
            ]);
        }

        return to_route('bookings.show', $appointment);
    }
}
