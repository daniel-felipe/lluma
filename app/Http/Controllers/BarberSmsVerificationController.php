<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\CreateBarber;
use App\Actions\InitializeBarberProfile;
use App\Actions\VerifySmsCode;
use App\Enums\SmsVerificationPurpose;
use App\Exceptions\Sms\CodeExhaustedException;
use App\Exceptions\Sms\CodeExpiredException;
use App\Exceptions\Sms\CodeInvalidException;
use App\Exceptions\Sms\NoActiveCodeException;
use App\Http\Requests\VerifySmsCodeRequest;
use App\Models\SmsVerification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class BarberSmsVerificationController
{
    public function create(Request $request): Response | RedirectResponse
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

        $resendAvailableAt = $latest
            ? $latest->created_at->addSeconds(60)->toIso8601String()
            : null;

        return Inertia::render('onboarding/verify', [
            'phone'             => $this->maskPhone($phone),
            'resendAvailableAt' => $resendAvailableAt,
        ]);
    }

    public function store(VerifySmsCodeRequest $request): RedirectResponse
    {
        $phone = $request->session()->get('registration_phone');

        if (! is_string($phone) || $phone === '') {
            return to_route('register');
        }

        try {
            resolve(VerifySmsCode::class)->run($phone, $request->string('code')->toString(), SmsVerificationPurpose::Registration);
        } catch (CodeExpiredException) {
            return back()->withErrors(['code' => 'Código expirado. Solicite um novo.']);
        } catch (CodeExhaustedException) {
            return back()->withErrors(['code' => 'Muitas tentativas incorretas. Solicite um novo código.']);
        } catch (CodeInvalidException) {
            return back()->withErrors(['code' => 'Código incorreto.']);
        } catch (NoActiveCodeException) {
            return back()->withErrors(['code' => 'Nenhum código ativo encontrado. Solicite um novo.']);
        }

        $user = resolve(CreateBarber::class)->run($phone, $request->string('password')->toString());

        Auth::login($user);

        $request->session()->regenerate();

        resolve(InitializeBarberProfile::class)->run($user);

        $request->session()->forget('registration_phone');

        return to_route('onboarding.profile.edit');
    }

    private function maskPhone(string $phone): string
    {
        // E.164: +5531999990000 → skip +55 (3 chars), then DDD (2), first digit, mask, last4
        $local = mb_substr($phone, 3); // strip "+55"
        $ddd   = mb_substr($local, 0, 2);
        $first = mb_substr($local, 2, 1);
        $last4 = mb_substr($local, -4);

        return sprintf('(%s) %s****-%s', $ddd, $first, $last4);
    }
}
