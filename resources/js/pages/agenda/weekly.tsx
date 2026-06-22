import { Form, Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import WalkInController from '@/actions/App/Http/Controllers/WalkInController';
import WeeklyAgendaController from '@/actions/App/Http/Controllers/WeeklyAgendaController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type WeekAppointment = {
    id: string;
    client_name: string;
    starts_at: string;
    ends_at: string;
    status: 'confirmed' | 'completed' | 'no_show';
    service: {
        name: string;
        price_cents: number;
    };
};

type WalkInService = {
    id: string;
    name: string;
    price_cents: number;
    duration_minutes: number;
};

type Props = {
    week_start: string;
    opens_at: string;
    closes_at: string;
    appointments: WeekAppointment[];
    services: WalkInService[];
};

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const STATUS_COLORS: Record<WeekAppointment['status'], string> = {
    confirmed: 'bg-(--blue-100) text-(--blue-500) border-(--blue-500)/40',
    completed: 'bg-(--green-100) text-(--green-500) border-(--green-500)/40',
    no_show: 'bg-(--red-100) text-(--red-500) border-(--red-500)/40',
};

const STATUS_LABELS: Record<WeekAppointment['status'], string> = {
    confirmed: 'Confirmado',
    completed: 'Concluído',
    no_show: 'Não compareceu',
};

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function addDays(dateString: string, days: number): Date {
    const date = new Date(`${dateString}T00:00:00`);
    date.setDate(date.getDate() + days);

    return date;
}

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agenda da semana',
        href: WeeklyAgendaController.url(),
    },
];

export default function WeeklyAgenda({ week_start, opens_at, closes_at, appointments, services }: Props) {
    const [detail, setDetail] = useState<WeekAppointment | null>(null);
    const [walkInSlot, setWalkInSlot] = useState<{ date: string; time: string } | null>(null);
    const [manualServiceId, setManualServiceId] = useState('');

    const serviceOptions = services.map((s) => ({
        value: s.id,
        label: `${s.name} — ${formatPrice(s.price_cents)}`,
    }));

    const days = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const date = addDays(week_start, i);

                return {
                    key: toDateKey(date),
                    label: WEEKDAY_LABELS[i],
                    day: date.getDate(),
                    isToday: toDateKey(new Date()) === toDateKey(date),
                };
            }),
        [week_start],
    );

    const hours = useMemo(() => {
        const startHour = parseInt(opens_at.slice(0, 2), 10);
        const endHour = parseInt(closes_at.slice(0, 2), 10) + (closes_at.slice(3, 5) !== '00' ? 1 : 0);

        return Array.from({ length: Math.max(endHour - startHour, 1) }, (_, i) => startHour + i);
    }, [opens_at, closes_at]);

    const byDayHour = useMemo(() => {
        const map = new Map<string, WeekAppointment[]>();

        for (const appointment of appointments) {
            const startsAt = new Date(appointment.starts_at);
            const key = `${toDateKey(startsAt)}-${startsAt.getHours()}`;
            map.set(key, [...(map.get(key) ?? []), appointment]);
        }

        return map;
    }, [appointments]);

    const byDay = useMemo(() => {
        const map = new Map<string, WeekAppointment[]>();

        for (const appointment of appointments) {
            const key = toDateKey(new Date(appointment.starts_at));
            map.set(key, [...(map.get(key) ?? []), appointment]);
        }

        for (const list of map.values()) {
            list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
        }

        return map;
    }, [appointments]);

    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const activeDayKey =
        selectedDay ?? days.find((day) => day.isToday)?.key ?? days[0].key;
    const dayAppointments = byDay.get(activeDayKey) ?? [];

    const navigateWeek = (offset: number) => {
        router.get(
            WeeklyAgendaController.url({ query: { start: toDateKey(addDays(week_start, offset * 7)) } }),
            {},
            { preserveState: false },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda da semana" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Semana de {days[0].day} a {days[6].day}</h2>
                    <div className="flex gap-1">
                        <Button size="icon" variant="outline" onClick={() => navigateWeek(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => navigateWeek(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Mobile: day selector + list */}
                <div className="md:hidden">
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day) => (
                            <button
                                key={day.key}
                                type="button"
                                onClick={() => setSelectedDay(day.key)}
                                className={cn(
                                    'flex flex-col items-center rounded-lg py-2 text-xs font-medium transition-transform active:scale-[0.97]',
                                    day.key === activeDayKey
                                        ? 'bg-(--amber-50) text-(--amber-500)'
                                        : 'text-muted-foreground hover:bg-accent',
                                )}
                            >
                                <span>{day.label}</span>
                                <span className="text-base font-bold tabular-nums">
                                    {day.day}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 space-y-2">
                        {dayAppointments.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                                Nenhum agendamento neste dia.
                            </p>
                        ) : (
                            dayAppointments.map((appointment) => (
                                <button
                                    key={appointment.id}
                                    type="button"
                                    onClick={() => setDetail(appointment)}
                                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-(--shadow-1) transition-transform active:scale-[0.99]"
                                >
                                    <div className="w-14 shrink-0 text-center">
                                        <p className="font-semibold tabular-nums">
                                            {formatTime(appointment.starts_at)}
                                        </p>
                                        <p className="text-xs text-muted-foreground tabular-nums">
                                            {formatTime(appointment.ends_at)}
                                        </p>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">
                                            {appointment.client_name}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {appointment.service.name} ·{' '}
                                            {formatPrice(appointment.service.price_cents)}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'shrink-0 rounded border px-1.5 py-0.5 text-xs',
                                            STATUS_COLORS[appointment.status],
                                        )}
                                    >
                                        {STATUS_LABELS[appointment.status]}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Desktop: weekly grid */}
                <div className="hidden overflow-x-auto md:block">
                    <div className="min-w-[700px]">
                        {/* Header row */}
                        <div className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1">
                            <div />
                            {days.map((day) => (
                                <div
                                    key={day.key}
                                    className={`rounded-t-lg p-2 text-center text-sm font-medium ${
                                        day.isToday ? 'bg-[var(--amber-50)] text-[var(--amber-500)]' : 'text-muted-foreground'
                                    }`}
                                >
                                    {day.label} {day.day}
                                </div>
                            ))}
                        </div>

                        {/* Hour rows */}
                        {hours.map((hour) => (
                            <div key={hour} className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1">
                                <div className="py-3 pr-2 text-right text-xs text-muted-foreground">
                                    {String(hour).padStart(2, '0')}:00
                                </div>
                                {days.map((day) => {
                                    const cellAppointments = byDayHour.get(`${day.key}-${hour}`) ?? [];

                                    return (
                                        <button
                                            key={day.key}
                                            type="button"
                                            onClick={() =>
                                                cellAppointments.length === 0 &&
                                                setWalkInSlot({ date: day.key, time: `${String(hour).padStart(2, '0')}:00` })
                                            }
                                            className={`min-h-12 rounded-md border border-sidebar-border/50 p-1 text-left transition dark:border-sidebar-border ${
                                                cellAppointments.length === 0 ? 'hover:bg-accent' : 'cursor-default'
                                            }`}
                                        >
                                            {cellAppointments.map((appointment) => (
                                                <span
                                                    key={appointment.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setDetail(appointment);
                                                    }}
                                                    onKeyDown={(event) => event.key === 'Enter' && setDetail(appointment)}
                                                    className={`mb-0.5 block truncate rounded border px-1.5 py-0.5 text-xs ${STATUS_COLORS[appointment.status]}`}
                                                >
                                                    {new Date(appointment.starts_at).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}{' '}
                                                    {appointment.client_name}
                                                </span>
                                            ))}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Appointment detail dialog */}
            <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
                <DialogContent>
                    {detail && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{detail.client_name}</DialogTitle>
                                <DialogDescription>
                                    {detail.service.name} · {formatPrice(detail.service.price_cents)}
                                </DialogDescription>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">
                                {new Date(detail.starts_at).toLocaleString('pt-BR', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Manual booking dialog */}
            <Dialog open={walkInSlot !== null} onOpenChange={(open) => { if (!open) { setWalkInSlot(null); setManualServiceId(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agendamento manual</DialogTitle>
                        <DialogDescription>
                            {walkInSlot && `${walkInSlot.date.split('-').reverse().join('/')} às ${walkInSlot.time}`}
                        </DialogDescription>
                    </DialogHeader>

                    {walkInSlot && (
                        <Form
                            {...WalkInController.form()}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setWalkInSlot(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="date" value={walkInSlot.date} />

                                    <div className="space-y-2">
                                        <Label>Serviço</Label>
                                        <Combobox
                                            options={serviceOptions}
                                            value={manualServiceId}
                                            onValueChange={setManualServiceId}
                                            name="service_id"
                                            required
                                            placeholder="Selecione um serviço…"
                                            searchPlaceholder="Buscar serviço…"
                                        />
                                        <InputError message={errors.service_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="manual-time">Horário</Label>
                                        <Input id="manual-time" name="time" type="time" required defaultValue={walkInSlot.time} />
                                        <InputError message={errors.time} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="manual-name">Nome do cliente</Label>
                                        <Input id="manual-name" name="client_name" required placeholder="Nome" />
                                        <InputError message={errors.client_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="manual-phone">Telefone (opcional)</Label>
                                        <Input id="manual-phone" name="client_phone" type="tel" placeholder="(99) 99999-9999" />
                                        <InputError message={errors.client_phone} />
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={processing}>
                                            Agendar
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
