<?php

declare(strict_types = 1);

namespace App\Services\Evolution;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final readonly class EvolutionClient
{
    public function __construct(
        private string $baseUrl,
        private string $apiKey,
        private string $instance,
    ) {}

    public function sendText(string $phone, string $text, int $delayMs = 1200): Response
    {
        $response = $this->http()
            ->post('message/sendText/' . $this->instance, [
                'number'      => $phone,
                'text'        => $text,
                'delay'       => $delayMs,
                'linkPreview' => false,
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                sprintf('Evolution API error [%d]: %s', $response->status(), $response->body()),
            );
        }

        return $response;
    }

    private function http(): PendingRequest
    {
        return Http::baseUrl(mb_rtrim($this->baseUrl, '/') . '/')
            ->withHeader('apikey', $this->apiKey)
            ->acceptJson()
            ->asJson();
    }
}
