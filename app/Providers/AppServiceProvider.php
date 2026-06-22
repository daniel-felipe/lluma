<?php

declare(strict_types = 1);

namespace App\Providers;

use App\Contracts\SmsGateway;
use App\Contracts\WhatsAppGateway;
use App\Services\Evolution\EvolutionClient;
use App\Services\Evolution\EvolutionWhatsAppGateway;
use App\Services\LogWhatsAppGateway;
use App\Services\NullSmsGateway;
use App\Services\NullWhatsAppGateway;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerSmsGateway();
        $this->registerWhatsAppGateway();
    }

    private function registerSmsGateway(): void
    {
        if (! $this->app->environment('testing', 'local')) {
            return;
        }

        $this->app->bind(SmsGateway::class, NullSmsGateway::class);
    }

    private function registerWhatsAppGateway(): void
    {
        if ($this->app->environment('testing')) {
            $this->app->bind(WhatsAppGateway::class, NullWhatsAppGateway::class);

            return;
        }

        if (config('services.evolution.api_key')) {
            $this->app->singleton(EvolutionClient::class, fn (): EvolutionClient => new EvolutionClient(
                baseUrl: config('services.evolution.url'),
                apiKey: config('services.evolution.api_key'),
                instance: config('services.evolution.instance'),
            ));
            $this->app->bind(WhatsAppGateway::class, EvolutionWhatsAppGateway::class);

            return;
        }

        $this->app->bind(WhatsAppGateway::class, LogWhatsAppGateway::class);
    }
}
