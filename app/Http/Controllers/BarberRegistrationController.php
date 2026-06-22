<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\SendSmsVerificationCode;
use App\Enums\SmsVerificationPurpose;
use App\Http\Requests\RegisterBarberPhoneRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BarberRegistrationController
{
    public function create(Request $request): Response
    {
        return Inertia::render('onboarding/phone', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(RegisterBarberPhoneRequest $request): RedirectResponse
    {
        $phone = $request->normalizedPhone();

        if (User::query()->where('phone', $phone)->exists()) {
            return back()->withErrors(['phone' => 'Número já cadastrado. Faça login.']);
        }

        resolve(SendSmsVerificationCode::class)->run($phone, SmsVerificationPurpose::Registration);

        $request->session()->put('registration_phone', $phone);

        return to_route('register.verify');
    }
}
