<?php

declare(strict_types = 1);

namespace App\Services;

use App\Contracts\WhatsAppGateway;
use Illuminate\Support\Facades\Log;

/**
 * Stub gateway used until a real WhatsApp provider (Evolution API, Z-API,
 * Twilio…) is configured. Writes outgoing messages to the application log.
 */
final class LogWhatsAppGateway implements WhatsAppGateway
{
    public function send(string $phone, string $message): void
    {
        Log::info('WhatsApp message (stub gateway)', [
            'phone'   => $phone,
            'message' => $message,
        ]);
    }
}
