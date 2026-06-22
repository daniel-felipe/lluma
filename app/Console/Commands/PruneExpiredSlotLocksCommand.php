<?php

declare(strict_types = 1);

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Delete expired pending slot locks from the appointments table')]
#[Signature('appointments:prune-locks')]
final class PruneExpiredSlotLocksCommand extends Command
{
    public function handle(): int
    {
        $deleted = Appointment::query()
            ->where('status', AppointmentStatus::Pending->value)
            ->where('locked_until', '<', now())
            ->delete();

        $this->info(sprintf('Deleted %s expired slot lock(s).', $deleted));

        return self::SUCCESS;
    }
}
