<?php

declare(strict_types = 1);

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Jobs\SendWhatsAppBookingReminder;
use App\Models\Appointment;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Queue WhatsApp reminders for confirmed appointments starting within the next hour')]
#[Signature('appointments:send-reminders')]
final class SendAppointmentRemindersCommand extends Command
{
    public function handle(): int
    {
        $appointments = Appointment::query()
            ->where('status', AppointmentStatus::Confirmed->value)
            ->whereNull('reminder_sent_at')
            ->whereBetween('starts_at', [now(), now()->addHour()])
            ->get();

        foreach ($appointments as $appointment) {
            dispatch(new SendWhatsAppBookingReminder($appointment));

            $appointment->update(['reminder_sent_at' => now()]);
        }

        $this->info(sprintf('Queued %d reminder(s).', $appointments->count()));

        return self::SUCCESS;
    }
}
