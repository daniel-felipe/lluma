<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\SendSmsVerificationCode;
use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class BarberSmsResendController
{
    public function __invoke(Request $request): RedirectResponse
    {
        $phone = $request->session()->get('registration_phone');

        if (! is_string($phone) || $phone === '') {
            return to_route('register');
        }

        $latest = SmsVerification::query()
            ->forPhone($phone)
            ->forPurpose(SmsVerificationPurpose::Registration)
            ->latest()
            ->first();

        abort_if($latest && $latest->created_at->diffInSeconds(now()) < 60, 429, 'Aguarde antes de reenviar o código.');

        resolve(SendSmsVerificationCode::class)->run($phone, SmsVerificationPurpose::Registration);

        return back()->with('status', 'Código reenviado.');
    }
}
