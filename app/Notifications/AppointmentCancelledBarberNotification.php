<?php

declare(strict_types = 1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class AppointmentCancelledBarberNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $serviceName,
        public readonly int $cancelledCount,
    ) {
        //
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Agendamentos cancelados')
            ->markdown('mail.service.appointment-cancelled-barber', [
                'serviceName'    => $this->serviceName,
                'cancelledCount' => $this->cancelledCount,
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
