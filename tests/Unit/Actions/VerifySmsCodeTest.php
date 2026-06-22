<?php

declare(strict_types = 1);

use App\Actions\VerifySmsCode;
use App\Enums\SmsVerificationPurpose;
use App\Exceptions\Sms\CodeExhaustedException;
use App\Exceptions\Sms\CodeExpiredException;
use App\Exceptions\Sms\CodeInvalidException;
use App\Exceptions\Sms\NoActiveCodeException;
use App\Models\SmsVerification;
use Illuminate\Support\Facades\Hash;

it('marks verified_at on correct code', function (): void {
    $verification = SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $action = resolve(VerifySmsCode::class);
    $result = $action->run('+5531999990000', '123456', SmsVerificationPurpose::Registration);

    expect($result->verified_at)->not->toBeNull()
        ->and($verification->fresh()->verified_at)->not->toBeNull();
});

it('throws CodeInvalidException and increments attempt_count for wrong code', function (): void {
    $verification = SmsVerification::factory()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $action = resolve(VerifySmsCode::class);

    expect(fn () => $action->run('+5531999990000', '000000', SmsVerificationPurpose::Registration))
        ->toThrow(CodeInvalidException::class);

    expect($verification->fresh()->attempt_count)->toBe(1);
});

it('throws CodeExpiredException for expired code', function (): void {
    SmsVerification::factory()->expired()->create([
        'phone'   => '+5531999990000',
        'code'    => Hash::make('123456'),
        'purpose' => SmsVerificationPurpose::Registration,
    ]);

    $action = resolve(VerifySmsCode::class);

    expect(fn () => $action->run('+5531999990000', '123456', SmsVerificationPurpose::Registration))
        ->toThrow(CodeExpiredException::class);
});

it('throws CodeExhaustedException when attempt limit reached', function (): void {
    SmsVerification::factory()->exhausted()->create([
        'phone'      => '+5531999990000',
        'code'       => Hash::make('123456'),
        'purpose'    => SmsVerificationPurpose::Registration,
        'expires_at' => now()->addMinutes(10),
    ]);

    $action = resolve(VerifySmsCode::class);

    expect(fn () => $action->run('+5531999990000', '123456', SmsVerificationPurpose::Registration))
        ->toThrow(CodeExhaustedException::class);
});

it('throws NoActiveCodeException when no active verification exists', function (): void {
    $action = resolve(VerifySmsCode::class);

    expect(fn () => $action->run('+5531999990000', '123456', SmsVerificationPurpose::Registration))
        ->toThrow(NoActiveCodeException::class);
});
