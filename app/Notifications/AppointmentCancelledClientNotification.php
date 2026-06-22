<?php

declare(strict_types = 1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class AppointmentCancelledClientNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $appointmentDate,
        public readonly string $serviceName,
        public readonly string $barberName,
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
            ->subject('Agendamento cancelado')
            ->markdown('mail.service.appointment-cancelled-client', [
                'appointmentDate' => $this->appointmentDate,
                'serviceName'     => $this->serviceName,
                'barberName'      => $this->barberName,
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
