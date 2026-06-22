<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Contracts\SmsGateway;
use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use Illuminate\Support\Facades\Hash;

final readonly class SendSmsVerificationCode
{
    public function __construct(private SmsGateway $smsGateway) {}

    public function run(string $phone, SmsVerificationPurpose $purpose): SmsVerification
    {
        $code = (string) random_int(100000, 999999);

        $verification = SmsVerification::query()->create([
            'phone'         => $phone,
            'code'          => Hash::make($code),
            'purpose'       => $purpose,
            'expires_at'    => now()->addMinutes(10),
            'attempt_count' => 0,
        ]);

        $this->smsGateway->send($phone, 'Seu código de verificação GoBarber: ' . $code);

        return $verification;
    }
}
