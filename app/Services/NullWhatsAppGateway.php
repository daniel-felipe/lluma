<?php

declare(strict_types = 1);

namespace App\Services;

use App\Contracts\WhatsAppGateway;

final class NullWhatsAppGateway implements WhatsAppGateway
{
    /** @var array<int, array{phone: string, message: string}> */
    public static array $sent = [];

    public function send(string $phone, string $message): void
    {
        self::$sent[] = ['phone' => $phone, 'message' => $message];
    }
}
