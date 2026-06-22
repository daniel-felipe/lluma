<?php

declare(strict_types = 1);

use App\Actions\SendSmsVerificationCode;
use App\Contracts\SmsGateway;
use App\Enums\SmsVerificationPurpose;
use App\Models\SmsVerification;
use App\Services\NullSmsGateway;
use Illuminate\Support\Facades\Hash;

beforeEach(function (): void {
    NullSmsGateway::$sent = [];
});

it('creates sms verification with hashed code expiring in 10 minutes', function (): void {
    $action = resolve(SendSmsVerificationCode::class);
    $result = $action->run('+5531999990000', SmsVerificationPurpose::Registration);

    expect($result)->toBeInstanceOf(SmsVerification::class)
        ->and($result->phone)->toBe('+5531999990000')
        ->and($result->purpose)->toBe(SmsVerificationPurpose::Registration)
        ->and($result->expires_at->timestamp)->toBe(now()->addMinutes(10)->timestamp)
        ->and($result->verified_at)->toBeNull()
        ->and($result->attempt_count)->toBe(0);

    expect(Hash::check('123456', $result->code))->toBeFalse(); // code is random
    expect(SmsVerification::query()->count())->toBe(1);
});

it('calls sms gateway with phone and message containing 6-digit code', function (): void {
    $action = resolve(SendSmsVerificationCode::class);
    $action->run('+5531999990000', SmsVerificationPurpose::Registration);

    expect(NullSmsGateway::$sent)->toHaveCount(1)
        ->and(NullSmsGateway::$sent[0]['phone'])->toBe('+5531999990000');

    preg_match('/\d{6}/', NullSmsGateway::$sent[0]['message'], $matches);
    expect($matches)->not->toBeEmpty();
});

it('returns the created sms verification model', function (): void {
    $action = resolve(SendSmsVerificationCode::class);
    $result = $action->run('+5531999990000', SmsVerificationPurpose::Registration);

    expect($result)->toBeInstanceOf(SmsVerification::class);
});

it('resolves sms gateway from container', function (): void {
    $gateway = resolve(SmsGateway::class);

    expect($gateway)->toBeInstanceOf(NullSmsGateway::class);
});
