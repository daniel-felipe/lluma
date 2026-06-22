import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CalendarClock, CalendarPlus, CheckCircle2, Clock, MapPin, Scissors, XCircle } from 'lucide-react';
import BookingCancellationController from '@/actions/App/Http/Controllers/BookingCancellationController';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';

type Props = {
    appointment: {
        id: string;
        client_name: string;
        starts_at: string;
        status: string;
        can_cancel: boolean;
        service: {
            name: string;
            price_cents: number;
            duration_minutes: number;
        };
        barber: {
            slug: string;
            business_name: string;
            address: string;
        };
    };
};

function buildGoogleCalendarUrl(appointment: Props['appointment']): string {
    const start = new Date(appointment.starts_at);
    const end = new Date(start.getTime() + appointment.service.duration_minutes * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${appointment.service.name} – ${appointment.barber.business_name}`,
        dates: `${fmt(start)}/${fmt(end)}`,
        location: appointment.barber.address,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export default function BookingConfirmation({ appointment }: Props) {
    const startsAt = new Date(appointment.starts_at);
    const dateLabel = startsAt.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
    });
    const timeLabel = startsAt.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isCancelled = appointment.status === 'cancelled';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Agendamento confirmado" />

            <div className="mx-auto max-w-md px-4 py-12">
                <div className="mb-8 flex flex-col items-center text-center">
                    <CheckCircle2
                        className={`mb-3 h-14 w-14 ${isCancelled ? 'text-muted-foreground' : 'text-(--green-500)'}`}
                    />
                    <h1 className="text-2xl font-bold">
                        {isCancelled ? 'Agendamento cancelado' : 'Agendamento confirmado'}
                    </h1>
                    {!isCancelled && (
                        <p className="mt-1 text-muted-foreground">Até lá, {appointment.client_name}.</p>
                    )}
                </div>

                <Panel className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                        <Scissors className="h-5 w-5 shrink-0 text-primary" />
                        <div>
                            <p className="font-medium">{appointment.service.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {appointment.barber.business_name} · {formatPrice(appointment.service.price_cents)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 shrink-0 text-primary" />
                        <p className="capitalize">{dateLabel}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-primary" />
                        <p>
                            {timeLabel} · {appointment.service.duration_minutes} min
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 shrink-0 text-primary" />
                        <p className="text-sm">{appointment.barber.address}</p>
                    </div>
                </Panel>

                <div className="mt-6 space-y-3">
                    {!isCancelled && (
                        <Button asChild variant="outline" className="w-full">
                            <a href={buildGoogleCalendarUrl(appointment)} target="_blank" rel="noopener noreferrer">
                                <CalendarPlus className="h-4 w-4" /> Adicionar ao Google Calendar
                            </a>
                        </Button>
                    )}

                    {appointment.can_cancel && (
                        <>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    router.post(BookingCancellationController.url({ appointment: appointment.id }), {
                                        reschedule: true,
                                    })
                                }
                            >
                                <CalendarClock className="h-4 w-4" /> Remarcar horário
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-destructive hover:text-destructive/80"
                                onClick={() =>
                                    confirm('Tem certeza que deseja cancelar este agendamento?') &&
                                    router.post(BookingCancellationController.url({ appointment: appointment.id }))
                                }
                            >
                                <XCircle className="h-4 w-4" /> Cancelar agendamento
                            </Button>
                        </>
                    )}

                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/${appointment.barber.slug}`}>
                            {isCancelled ? 'Fazer novo agendamento' : 'Agendar outro horário'}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
