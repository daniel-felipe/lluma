<?php

declare(strict_types = 1);

use App\Notifications\AppointmentCancelledClientNotification;
use Illuminate\Notifications\Messages\MailMessage;

it('sends via mail channel', function (): void {
    $notification = new AppointmentCancelledClientNotification('2026-05-04', 'Corte', 'João');

    expect($notification->via(new stdClass()))->toBe(['mail']);
});

it('builds mail message with correct subject and data', function (): void {
    $notification = new AppointmentCancelledClientNotification('2026-05-04', 'Barba', 'João');

    $mail = $notification->toMail(new stdClass());

    expect($mail)->toBeInstanceOf(MailMessage::class)
        ->and($mail->subject)->toBe('Agendamento cancelado');
});

it('to array returns empty array', function (): void {
    $notification = new AppointmentCancelledClientNotification('2026-05-04', 'Corte', 'João');

    expect($notification->toArray(new stdClass()))->toBe([]);
});
