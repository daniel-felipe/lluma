<?php

declare(strict_types = 1);

use App\Console\Commands\PruneExpiredSlotLocksCommand;
use App\Console\Commands\SendAppointmentRemindersCommand;
use Illuminate\Support\Facades\Schedule;

Schedule::command(PruneExpiredSlotLocksCommand::class)->daily();
Schedule::command(SendAppointmentRemindersCommand::class)->everyFiveMinutes();
