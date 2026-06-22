<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\ToggleService;
use App\Exceptions\ServiceException;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class ServiceToggleController
{
    public function __invoke(Request $request, string $service): RedirectResponse
    {
        /** @var User $user */
        $user    = $request->user();
        $profile = $user->barberProfile;

        $serviceModel = $profile->services()->where('id', $service)->first();

        abort_if($serviceModel === null, 404);

        try {
            resolve(ToggleService::class)->run($serviceModel);
        } catch (ServiceException $serviceException) {
            return back()->withErrors(['service' => $serviceException->getMessage()]);
        }

        return to_route('onboarding.services.index');
    }
}
