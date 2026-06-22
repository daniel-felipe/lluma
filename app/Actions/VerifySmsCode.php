<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Enums\SmsVerificationPurpose;
use App\Exceptions\Sms\CodeExhaustedException;
use App\Exceptions\Sms\CodeExpiredException;
use App\Exceptions\Sms\CodeInvalidException;
use App\Exceptions\Sms\NoActiveCodeException;
use App\Models\SmsVerification;
use Illuminate\Support\Facades\Hash;

final readonly class VerifySmsCode
{
    /**
     * @throws NoActiveCodeException
     * @throws CodeExhaustedException
     * @throws CodeExpiredException
     * @throws CodeInvalidException
     */
    public function run(string $phone, string $code, SmsVerificationPurpose $purpose): SmsVerification
    {
        /** @var SmsVerification|null $verification */
        $verification = SmsVerification::query()
            ->forPhone($phone)
            ->forPurpose($purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        throw_unless($verification, NoActiveCodeException::class, 'No active verification code found.');

        throw_if($verification->attempt_count >= 5, CodeExhaustedException::class, 'Too many failed attempts.');

        throw_if($verification->expires_at->isPast(), CodeExpiredException::class, 'Verification code has expired.');

        if (! Hash::check($code, $verification->code)) {
            $verification->increment('attempt_count');

            throw new CodeInvalidException('Invalid verification code.');
        }

        $verification->update(['verified_at' => now()]);

        return $verification->fresh() ?? $verification;
    }
}
