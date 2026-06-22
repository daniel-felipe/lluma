<?php

declare(strict_types = 1);

namespace App\Services\Evolution;

use App\Contracts\WhatsAppGateway;

final readonly class EvolutionWhatsAppGateway implements WhatsAppGateway
{
    public function __construct(private EvolutionClient $client) {}

    public function send(string $phone, string $message): void
    {
        $this->client->sendText($phone, $message);
    }
}
