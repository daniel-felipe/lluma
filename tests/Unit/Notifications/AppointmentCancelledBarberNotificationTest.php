<?php

declare(strict_types = 1);

use App\Notifications\AppointmentCancelledBarberNotification;
use Illuminate\Notifications\Messages\MailMessage;

it('sends via mail channel', function (): void {
    $notification = new AppointmentCancelledBarberNotification('Corte', 3);

    expect($notification->via(new stdClass()))->toBe(['mail']);
});

it('builds mail message with correct subject and data', function (): void {
    $notification = new AppointmentCancelledBarberNotification('Barba', 2);

    $mail = $notification->toMail(new stdClass());

    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toBe('Agendamentos cancelados');
});

it('to array returns empty array', function (): void {
    $notification = new AppointmentCancelledBarberNotification('Corte', 1);

    expect($notification->toArray(new stdClass()))->toBe([]);
});
