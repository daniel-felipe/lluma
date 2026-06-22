<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\ReorderServices;
use App\Exceptions\ServiceException;
use App\Http\Requests\ReorderServicesRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

final class ServiceOrderController
{
    public function __invoke(ReorderServicesRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $validated = $request->validated();

        try {
            resolve(ReorderServices::class)->run($profile, $validated['order']);
        } catch (ServiceException $serviceException) {
            return back()->withErrors(['order' => $serviceException->getMessage()]);
        }

        return to_route('onboarding.services.index');
    }
}
