<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\SaveBarberSchedule;
use App\Enums\BarberOnboardingStep;
use App\Http\Requests\UpdateBarberScheduleRequest;
use App\Models\BarberScheduleDay;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BarberScheduleController
{
    public function show(Request $request): Response
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $schedule = $profile->schedule;

        if ($schedule !== null) {
            $days = $schedule->days()
                ->orderBy('day_of_week')
                ->get()
                ->map(fn (BarberScheduleDay $day): array => [
                    'day_of_week'     => $day->day_of_week,
                    'is_open'         => $day->is_open,
                    'opens_at'        => $day->opens_at !== null ? mb_substr($day->opens_at, 0, 5) : null,
                    'closes_at'       => $day->closes_at !== null ? mb_substr($day->closes_at, 0, 5) : null,
                    'break_starts_at' => $day->break_starts_at !== null ? mb_substr($day->break_starts_at, 0, 5) : null,
                    'break_ends_at'   => $day->break_ends_at !== null ? mb_substr($day->break_ends_at, 0, 5) : null,
                ])
                ->all();

            $scheduleData = [
                'buffer_minutes' => $schedule->buffer_minutes,
                'days'           => $days,
            ];
        } else {
            $scheduleData = $this->defaultSchedule();
        }

        return Inertia::render('onboarding/availability', [
            'schedule'        => $scheduleData,
            'is_onboarding'   => $profile->onboarding_step !== BarberOnboardingStep::Complete,
            'onboarding_step' => 'availability',
            'steps'           => ['profile', 'services', 'availability'],
        ]);
    }

    public function update(UpdateBarberScheduleRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $wasOnboarding = $profile->onboarding_step !== BarberOnboardingStep::Complete;

        resolve(SaveBarberSchedule::class)->run($profile, $request->validated());

        if ($wasOnboarding) {
            return to_route('dashboard');
        }

        return to_route('onboarding.availability.show');
    }

    /**
     * @return array{buffer_minutes: int, days: array<int, array<string, mixed>>}
     */
    private function defaultSchedule(): array
    {
        $days = [];

        for ($day = 1; $day <= 7; $day++) {
            if ($day <= 5) {
                // Monday–Friday: 09:00–19:00
                $days[] = [
                    'day_of_week'     => $day,
                    'is_open'         => true,
                    'opens_at'        => '09:00',
                    'closes_at'       => '19:00',
                    'break_starts_at' => null,
                    'break_ends_at'   => null,
                ];
            } elseif ($day === 6) {
                // Saturday: 08:00–17:00
                $days[] = [
                    'day_of_week'     => $day,
                    'is_open'         => true,
                    'opens_at'        => '08:00',
                    'closes_at'       => '17:00',
                    'break_starts_at' => null,
                    'break_ends_at'   => null,
                ];
            } else {
                // Sunday: closed
                $days[] = [
                    'day_of_week'     => $day,
                    'is_open'         => false,
                    'opens_at'        => null,
                    'closes_at'       => null,
                    'break_starts_at' => null,
                    'break_ends_at'   => null,
                ];
            }
        }

        return [
            'buffer_minutes' => 0,
            'days'           => $days,
        ];
    }
}
