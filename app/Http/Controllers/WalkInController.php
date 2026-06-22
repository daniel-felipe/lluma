<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CreateWalkIn;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Validation\ValidationException;

final class WalkInController
{
    public function __invoke(Request $request): RedirectResponse
    {
        $barberProfile = $request->user()?->barberProfile;

        abort_if($barberProfile === null, 404);

        $validated = $request->validate([
            'service_id'   => ['required', 'uuid'],
            'date'         => ['required', 'date_format:Y-m-d'],
            'time'         => ['required', 'date_format:H:i'],
            'client_name'  => ['required', 'string', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $service = Service::query()
            ->whereBelongsTo($barberProfile, 'barberProfile')
            ->where('id', $validated['service_id'])
            ->first();

        if ($service === null) {
            throw ValidationException::withMessages([
                'service_id' => 'Service not found for this barber.',
            ]);
        }

        resolve(CreateWalkIn::class)->run(
            $barberProfile,
            $service,
            Date::parse($validated['date'] . ' ' . $validated['time']),
            $validated['client_name'],
            $validated['client_phone'] ?? '',
        );

        return back();
    }
}
