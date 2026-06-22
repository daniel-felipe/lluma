<?php

declare(strict_types = 1);

namespace App\Services;

use App\Contracts\SmsGateway;

final class NullSmsGateway implements SmsGateway
{
    /** @var array<int, array{phone: string, message: string}> */
    public static array $sent = [];

    public function send(string $phone, string $message): void
    {
        self::$sent[] = ['phone' => $phone, 'message' => $message];
    }
}
