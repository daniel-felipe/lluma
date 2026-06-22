<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\BarberOnboardingStep;
use App\Models\Appointment;
use App\Models\BarberProfile;
use App\Models\BarberSchedule;
use App\Models\BarberScheduleDay;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()
            ->phoneVerified()
            ->withoutTwoFactor()
            ->create([
                'name'  => 'Rafael Mendes',
                'email' => 'test@example.com',
                'phone' => '+5511987654321',
            ]);

        $profile = BarberProfile::factory()
            ->for($user)
            ->published()
            ->create([
                'business_name'        => 'Barbearia Navalha de Ouro',
                'slug'                 => 'navalha-de-ouro',
                'address_street'       => 'Rua Harmonia',
                'address_number'       => '412',
                'address_neighborhood' => 'Vila Madalena',
                'address_city'         => 'São Paulo',
                'address_state'        => 'SP',
                'address_cep'          => '05435-000',
                'onboarding_step'      => BarberOnboardingStep::Complete,
                'link_visits'          => 247,
            ]);

        $corte      = Service::factory()->for($profile, 'barberProfile')->create(['name' => 'Corte degradê', 'price_cents' => 5500, 'duration_minutes' => 40, 'sort_order' => 1]);
        $barba      = Service::factory()->for($profile, 'barberProfile')->create(['name' => 'Barba completa', 'price_cents' => 4000, 'duration_minutes' => 30, 'sort_order' => 2]);
        $combo      = Service::factory()->for($profile, 'barberProfile')->create(['name' => 'Corte + barba', 'price_cents' => 8500, 'duration_minutes' => 60, 'sort_order' => 3]);
        $acabamento = Service::factory()->for($profile, 'barberProfile')->create(['name' => 'Acabamento', 'price_cents' => 2500, 'duration_minutes' => 15, 'sort_order' => 4]);

        Service::factory()->for($profile, 'barberProfile')->inactive()->create([
            'name'             => 'Hidratação capilar',
            'price_cents'      => 7000,
            'duration_minutes' => 45,
            'sort_order'       => 5,
        ]);

        $schedule = BarberSchedule::factory()->forProfile($profile)->withBuffer(10)->create();

        foreach (range(1, 5) as $day) {
            BarberScheduleDay::factory()->forSchedule($schedule)->open()->withBreak()->create([
                'day_of_week' => $day,
                'opens_at'    => '09:00:00',
                'closes_at'   => '19:00:00',
            ]);
        }

        BarberScheduleDay::factory()->forSchedule($schedule)->open()->create([
            'day_of_week' => 6,
            'opens_at'    => '08:00:00',
            'closes_at'   => '17:00:00',
        ]);

        BarberScheduleDay::factory()->forSchedule($schedule)->closed()->create(['day_of_week' => 7]);

        $today = today();

        // Agenda de hoje
        Appointment::factory()->for($profile)->for($corte)->completed()->create([
            'client_name'  => 'Pedro Almeida',
            'client_phone' => '(11) 98765-1234',
            'starts_at'    => $today->copy()->setTime(9, 0),
            'ends_at'      => $today->copy()->setTime(9, 40),
        ]);

        Appointment::factory()->for($profile)->for($barba)->completed()->create([
            'client_name'  => 'Lucas Ferreira',
            'client_phone' => '(11) 97654-3210',
            'starts_at'    => $today->copy()->setTime(10, 0),
            'ends_at'      => $today->copy()->setTime(10, 30),
        ]);

        Appointment::factory()->for($profile)->for($combo)->confirmed()->create([
            'client_name'  => 'Rafael Costa',
            'client_phone' => '(11) 96543-2109',
            'starts_at'    => $today->copy()->setTime(14, 0),
            'ends_at'      => $today->copy()->setTime(15, 0),
        ]);

        Appointment::factory()->for($profile)->for($corte)->confirmed()->create([
            'client_name'  => 'Bruno Santos',
            'client_phone' => '(11) 95432-1098',
            'starts_at'    => $today->copy()->setTime(16, 0),
            'ends_at'      => $today->copy()->setTime(16, 40),
        ]);

        Appointment::factory()->for($profile)->for($acabamento)->noShow()->create([
            'client_name'  => 'Thiago Oliveira',
            'client_phone' => '(11) 94321-0987',
            'starts_at'    => $today->copy()->setTime(11, 30),
            'ends_at'      => $today->copy()->setTime(11, 45),
        ]);

        // Histórico recente
        $yesterday = $today->copy()->subDay();

        Appointment::factory()->for($profile)->for($corte)->completed()->create([
            'client_name'  => 'Gabriel Souza',
            'client_phone' => '(11) 93210-9876',
            'starts_at'    => $yesterday->copy()->setTime(10, 0),
            'ends_at'      => $yesterday->copy()->setTime(10, 40),
        ]);

        Appointment::factory()->for($profile)->for($combo)->completed()->create([
            'client_name'  => 'Matheus Lima',
            'client_phone' => '(11) 92109-8765',
            'starts_at'    => $yesterday->copy()->setTime(15, 0),
            'ends_at'      => $yesterday->copy()->setTime(16, 0),
        ]);

        Appointment::factory()->for($profile)->for($barba)->cancelled()->create([
            'client_name'  => 'Felipe Rocha',
            'client_phone' => '(11) 91098-7654',
            'starts_at'    => $yesterday->copy()->setTime(17, 0),
            'ends_at'      => $yesterday->copy()->setTime(17, 30),
        ]);

        // Próximos dias
        $nextMonday = $today->copy()->next(Carbon::MONDAY);

        Appointment::factory()->for($profile)->for($corte)->confirmed()->create([
            'client_name'  => 'André Martins',
            'client_phone' => '(11) 90987-6543',
            'starts_at'    => $nextMonday->copy()->setTime(9, 0),
            'ends_at'      => $nextMonday->copy()->setTime(9, 40),
        ]);

        Appointment::factory()->for($profile)->for($combo)->confirmed()->create([
            'client_name'  => 'Diego Pereira',
            'client_phone' => '(11) 99876-5432',
            'starts_at'    => $nextMonday->copy()->setTime(11, 0),
            'ends_at'      => $nextMonday->copy()->setTime(12, 0),
        ]);
    }
}
