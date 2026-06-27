<x-mail::message>
# Agendamento cancelado

@if ($cancelledCount === 1)
Um agendamento de **{{ $serviceName }}** foi cancelado.
@else
{{ $cancelledCount }} agendamentos de **{{ $serviceName }}** foram cancelados.
@endif

Confira sua agenda para ver os horários que ficaram livres.

Obrigado,<br>
{{ config('app.name') }}
</x-mail::message>
