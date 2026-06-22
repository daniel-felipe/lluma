<?php

declare(strict_types = 1);

use App\Contracts\WhatsAppGateway;
use App\Services\Evolution\EvolutionClient;
use App\Services\Evolution\EvolutionWhatsAppGateway;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

covers(EvolutionWhatsAppGateway::class, EvolutionClient::class);

beforeEach(function (): void {
    Http::preventStrayRequests();
});

it('posts send-text request with correct shape', function (): void {
    Http::fake([
        'https://evolution.example.com/message/sendText/my-instance' => Http::response([
            'key'    => ['id' => 'abc123', 'fromMe' => true, 'remoteJid' => '5511999990000@s.whatsapp.net'],
            'status' => 'PENDING',
        ], 201),
    ]);

    $client  = new EvolutionClient('https://evolution.example.com', 'secret-key', 'my-instance');
    $gateway = new EvolutionWhatsAppGateway($client);

    $gateway->send('5511999990000', 'Olá, seu horário foi confirmado!');

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://evolution.example.com/message/sendText/my-instance'
        && $request->method() === 'POST'
        && $request->header('apikey')[0] === 'secret-key'
        && $request['number'] === '5511999990000'
        && $request['text'] === 'Olá, seu horário foi confirmado!'
        && $request['linkPreview'] === false);
});

it('throws RuntimeException on API error response', function (): void {
    Http::fake([
        'https://evolution.example.com/message/sendText/my-instance' => Http::response(
            ['error' => 'Unauthorized'],
            401,
        ),
    ]);

    $client  = new EvolutionClient('https://evolution.example.com', 'wrong-key', 'my-instance');
    $gateway = new EvolutionWhatsAppGateway($client);

    expect(fn () => $gateway->send('5511999990000', 'test'))->toThrow(RuntimeException::class);
});

it('implements WhatsAppGateway contract', function (): void {
    $client  = new EvolutionClient('https://evolution.example.com', 'key', 'instance');
    $gateway = new EvolutionWhatsAppGateway($client);

    expect($gateway)->toBeInstanceOf(WhatsAppGateway::class);
});
