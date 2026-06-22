<?php

declare(strict_types = 1);

use App\Models\SmsVerification;

it('scope active returns only unexpired unverified codes', function (): void {
    SmsVerification::factory()->create();
    SmsVerification::factory()->expired()->create();
    SmsVerification::factory()->verified()->create();

    expect(SmsVerification::query()->active()->count())->toBe(1);
});
