<?php

declare(strict_types = 1);

use App\Contracts\WhatsAppGateway;
use App\Providers\AppServiceProvider;
use App\Services\Evolution\EvolutionClient;
use App\Services\Evolution\EvolutionWhatsAppGateway;
use App\Services\LogWhatsAppGateway;
use Illuminate\Foundation\Application;

covers(AppServiceProvider::class);

it('binds EvolutionWhatsAppGateway when evolution api_key is configured', function (): void {
    config([
        'services.evolution.url'      => 'https://evolution.example.com',
        'services.evolution.api_key'  => 'secret',
        'services.evolution.instance' => 'my-instance',
    ]);

    $app = Mockery::mock(Application::class);
    $app->shouldReceive('environment')->with('testing', 'local')->andReturn(false);
    $app->shouldReceive('environment')->with('testing')->andReturn(false);
    $app->shouldReceive('singleton')->once()->with(EvolutionClient::class, Mockery::type(Closure::class));
    $app->shouldReceive('bind')->once()->with(WhatsAppGateway::class, EvolutionWhatsAppGateway::class);

    $provider = new AppServiceProvider($app);
    $provider->register();
});

it('binds LogWhatsAppGateway when no evolution api_key configured', function (): void {
    config(['services.evolution.api_key' => null]);

    $app = Mockery::mock(Application::class);
    $app->shouldReceive('environment')->with('testing', 'local')->andReturn(false);
    $app->shouldReceive('environment')->with('testing')->andReturn(false);
    $app->shouldReceive('bind')->once()->with(WhatsAppGateway::class, LogWhatsAppGateway::class);

    $provider = new AppServiceProvider($app);
    $provider->register();
});
