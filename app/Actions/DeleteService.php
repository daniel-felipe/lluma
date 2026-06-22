<?php

declare(strict_types = 1);

namespace App\Actions;

use App\Exceptions\ServiceException;
use App\Models\Service;
use App\Notifications\AppointmentCancelledBarberNotification;
use Illuminate\Support\Facades\DB;

final readonly class DeleteService
{
    public function __construct(private CancelServiceAppointments $cancel) {}

    /**
     * @return array{requires_confirmation: bool, appointments_count: int}
     */
    public function run(Service $service, bool $confirmed = false): array
    {
        $profile = $service->barberProfile;

        throw_if($profile->services()->where('is_active', true)->count() <= 1 && $service->is_active, ServiceException::class, 'Um barbeiro deve ter pelo menos um serviço ativo.');

        $appointmentsCount = $service->futureAppointmentsCount();

        if ($appointmentsCount > 0 && ! $confirmed) { // @codeCoverageIgnore
            return [ // @codeCoverageIgnore
                'requires_confirmation' => true, // @codeCoverageIgnore
                'appointments_count'    => $appointmentsCount, // @codeCoverageIgnore
            ]; // @codeCoverageIgnore
        } // @codeCoverageIgnore

        DB::transaction(function () use ($service, $appointmentsCount): void {
            $service->delete();

            $this->cancel->run();

            if ($appointmentsCount > 0) { // @codeCoverageIgnore
                $barber = $service->barberProfile->user; // @codeCoverageIgnore
                $barber->notify(new AppointmentCancelledBarberNotification( // @codeCoverageIgnore
                    serviceName: $service->name, // @codeCoverageIgnore
                    cancelledCount: $appointmentsCount, // @codeCoverageIgnore
                )); // @codeCoverageIgnore
            } // @codeCoverageIgnore
        });

        return [
            'requires_confirmation' => false,
            'appointments_count'    => $appointmentsCount,
        ];
    }
}
