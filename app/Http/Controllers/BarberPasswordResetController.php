<?php

declare(strict_types = 1);

namespace App\Http\Controllers;

use App\Actions\SendSmsVerificationCode;
use App\Actions\VerifySmsCode;
use App\Enums\SmsVerificationPurpose;
use App\Exceptions\Sms\CodeExhaustedException;
use App\Exceptions\Sms\CodeExpiredException;
use App\Exceptions\Sms\CodeInvalidException;
use App\Exceptions\Sms\NoActiveCodeException;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

final readonly class BarberPasswordResetController
{
    public function __construct(
        private SendSmsVerificationCode $sendSmsVerificationCode,
        private VerifySmsCode $verifySmsCode,
    ) {}

    public function create(): Response
    {
        return Inertia::render('user-password/forgot-phone');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $normalized = '+55' . preg_replace('/\D/', '', $request->string('phone')->toString());
        $user       = User::query()->where('phone', $normalized)->first();

        if ($user) {
            $this->sendSmsVerificationCode->run($normalized, SmsVerificationPurpose::PasswordReset);
        }

        return to_route('password.reset-phone');
    }

    public function edit(): Response
    {
        return Inertia::render('user-password/reset-phone');
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'phone'    => ['required', 'string'],
            'code'     => ['required', 'string', 'digits:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $normalized = '+55' . preg_replace('/\D/', '', $request->string('phone')->toString());

        try {
            $this->verifySmsCode->run($normalized, $request->string('code')->toString(), SmsVerificationPurpose::PasswordReset);
        } catch (CodeExpiredException) {
            return back()->withErrors(['code' => 'Código expirado. Solicite um novo.']);
        } catch (CodeExhaustedException) {
            return back()->withErrors(['code' => 'Muitas tentativas incorretas. Solicite um novo código.']);
        } catch (CodeInvalidException) {
            return back()->withErrors(['code' => 'Código incorreto.']);
        } catch (NoActiveCodeException) {
            return back()->withErrors(['code' => 'Nenhum código ativo encontrado. Solicite um novo.']);
        }

        $user = User::query()->where('phone', $normalized)->firstOrFail();
        $user->update(['password' => Hash::make($request->string('password')->toString())]);

        return to_route('login')->with('status', 'Senha redefinida com sucesso.');
    }
}
