<?php

declare(strict_types = 1);

namespace App\Services;

use App\Models\Appointment;

/**
 * Builds the casual pt-BR WhatsApp message templates used across the
 * booking lifecycle (confirmation, reminder, cancellation).
 */
final class WhatsAppMessageComposer
{
    public function confirmation(Appointment $appointment): string
    {
        $barber = $appointment->barberProfile;

        return sprintf(
            "Oi %s! Seu horário tá confirmado ✅\n📅 %s às %s\n✂️ %s com %s\n📍 %s\nAté lá!",
            $appointment->client_name,
            $appointment->starts_at->format('d/m/Y'),
            $appointment->starts_at->format('H:i'),
            $appointment->service->name,
            $barber->business_name,
            $this->address($appointment),
        );
    }

    public function reminder(Appointment $appointment): string
    {
        return sprintf(
            "Lembrete: seu horário é daqui a 1 hora!\n✂️ %s às %s com %s\nPrecisando reagendar? Responda aqui.",
            $appointment->service->name,
            $appointment->starts_at->format('H:i'),
            $appointment->barberProfile->business_name,
        );
    }

    public function cancellation(Appointment $appointment): string
    {
        return sprintf(
            "Oi %s, seu horário de %s no dia %s às %s foi cancelado.\nQuer remarcar? É só agendar de novo. 🙏",
            $appointment->client_name,
            $appointment->service->name,
            $appointment->starts_at->format('d/m/Y'),
            $appointment->starts_at->format('H:i'),
        );
    }

    private function address(Appointment $appointment): string
    {
        $barber = $appointment->barberProfile;

        return sprintf(
            '%s, %s — %s, %s/%s',
            $barber->address_street,
            $barber->address_number,
            $barber->address_neighborhood,
            $barber->address_city,
            $barber->address_state,
        );
    }
}
