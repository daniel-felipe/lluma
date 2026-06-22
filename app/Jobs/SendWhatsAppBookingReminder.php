<?php

declare(strict_types = 1);

namespace App\Jobs;

use App\Contracts\WhatsAppGateway;
use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Services\WhatsAppMessageComposer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class SendWhatsAppBookingReminder implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Appointment $appointment) {}

    public function handle(WhatsAppGateway $gateway, WhatsAppMessageComposer $composer): void
    {
        // The appointment may have been cancelled between scheduling and execution
        if ($this->appointment->status !== AppointmentStatus::Confirmed || $this->appointment->client_phone === '') {
            return;
        }

        $this->appointment->load(['barberProfile', 'service']);

        $gateway->send($this->appointment->client_phone, $composer->reminder($this->appointment));
    }
}
