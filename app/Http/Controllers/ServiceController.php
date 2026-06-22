<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CreateService;
use App\Actions\DeleteService;
use App\Actions\UpdateService;
use App\Enums\BarberOnboardingStep;
use App\Exceptions\ServiceException;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class ServiceController
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $services = $profile->services()->ordered()->get();

        $templates = $services->isEmpty() ? [
            ['name' => 'Corte', 'price_cents' => 3500, 'duration_minutes' => 30],
            ['name' => 'Barba', 'price_cents' => 2500, 'duration_minutes' => 20],
            ['name' => 'Combo', 'price_cents' => 5500, 'duration_minutes' => 45],
        ] : null;

        return Inertia::render('onboarding/services', [
            'services' => $services->map(fn (Service $service): array => [
                'id'               => $service->id,
                'name'             => $service->name,
                'price_cents'      => $service->price_cents,
                'duration_minutes' => $service->duration_minutes,
                'is_active'        => $service->is_active,
                'sort_order'       => $service->sort_order,
            ]),
            'templates'       => $templates,
            'is_onboarding'   => $profile->onboarding_step !== BarberOnboardingStep::Complete,
            'onboarding_step' => 'services',
            'steps'           => ['profile', 'services', 'availability'],
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $validated = $request->validated();

        resolve(CreateService::class)->run(
            $profile,
            $validated['name'],
            (int) $validated['price_cents'],
            (int) $validated['duration_minutes'],
        );

        if ($profile->onboarding_step === BarberOnboardingStep::Services) {
            $profile->update(['onboarding_step' => BarberOnboardingStep::Availability]);
        }

        return to_route('onboarding.services.index');
    }

    public function update(UpdateServiceRequest $request, string $service): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        /** @var Service|null $serviceModel */
        $serviceModel = $profile->services()->where('id', $service)->first();

        abort_if($serviceModel === null, 404);

        $validated = $request->validated();

        resolve(UpdateService::class)->run(
            $serviceModel,
            $validated['name'],
            (int) $validated['price_cents'],
            (int) $validated['duration_minutes'],
        );

        return to_route('onboarding.services.index');
    }

    public function destroy(Request $request, string $service): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        /** @var Service|null $serviceModel */
        $serviceModel = $profile->services()->where('id', $service)->first();

        abort_if($serviceModel === null, 404);

        $confirmed = $request->boolean('confirm');

        try {
            $result = resolve(DeleteService::class)->run($serviceModel, $confirmed);
        } catch (ServiceException $serviceException) {
            return back()->withErrors(['service' => $serviceException->getMessage()]);
        }

        if ($result['requires_confirmation']) { // @codeCoverageIgnore
            return back()->with('appointments_count', $result['appointments_count']); // @codeCoverageIgnore
        } // @codeCoverageIgnore

        return to_route('onboarding.services.index');
    }
}
