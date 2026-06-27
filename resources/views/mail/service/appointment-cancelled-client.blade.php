<x-mail::message>
# Agendamento cancelado

Olá! Seu agendamento de **{{ $serviceName }}** com **{{ $barberName }}** no dia **{{ $appointmentDate }}** foi cancelado.

Se quiser, você pode escolher um novo horário a qualquer momento.

Obrigado,<br>
{{ config('app.name') }}
</x-mail::message>
