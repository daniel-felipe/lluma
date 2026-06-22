import { Form, Head, router } from '@inertiajs/react';
import { Check, Plus, UserX, X } from 'lucide-react';
import { useState } from 'react';
import AppointmentCancellationController from '@/actions/App/Http/Controllers/AppointmentCancellationController';
import AppointmentStatusController from '@/actions/App/Http/Controllers/AppointmentStatusController';
import WalkInController from '@/actions/App/Http/Controllers/WalkInController';
import InputError from '@/components/input-error';
import PhoneInput from '@/components/phone-input';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Panel } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
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
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type AgendaAppointment = {
    id: string;
    client_name: string;
    client_phone: string;
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
    appointments: AgendaAppointment[];
    metrics: {
        total_booked: number;
        completed: number;
        completed_revenue_cents: number;
    };
    services: WalkInService[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Agenda de hoje',
        href: dashboard(),
    },
];

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function timeOf(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function statusBadge(appointment: AgendaAppointment): { label: string; className: string } {
    const now = new Date();
    const inProgress =
        appointment.status === 'confirmed' &&
        new Date(appointment.starts_at) <= now &&
        new Date(appointment.ends_at) > now;

    if (inProgress) {
        return { label: 'Em andamento', className: 'bg-(--amber-50) text-(--amber-600) dark:text-(--amber-300)' };
    }

    switch (appointment.status) {
        case 'completed':
            return { label: 'Concluído', className: 'bg-(--green-100) text-(--green-500)' };
        case 'no_show':
            return { label: 'Não compareceu', className: 'bg-(--red-100) text-(--red-500)' };
        default:
            return { label: 'Agendado', className: 'bg-(--blue-100) text-(--blue-500)' };
    }
}

export default function DailyAgenda({ appointments, metrics, services }: Props) {
    const [walkInOpen, setWalkInOpen] = useState(false);
    const [walkInServiceId, setWalkInServiceId] = useState('');

    const serviceOptions = services.map((s) => ({
        value: s.id,
        label: `${s.name} · ${formatPrice(s.price_cents)}`,
    }));

    const updateStatus = (appointment: AgendaAppointment, status: 'completed' | 'no_show') => {
        router.patch(
            AppointmentStatusController.url({ appointment: appointment.id }),
            { status },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda de hoje" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <StatCard label="Agendados" value={metrics.total_booked} />
                    <StatCard label="Concluídos" value={metrics.completed} />
                    <StatCard
                        label="Faturamento"
                        value={formatPrice(metrics.completed_revenue_cents)}
                        className="col-span-2 sm:col-span-1"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Hoje</h2>
                    <Button size="sm" onClick={() => setWalkInOpen(true)}>
                        <Plus className="h-4 w-4" /> Encaixe
                    </Button>
                </div>

                {/* Timeline */}
                {appointments.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-sidebar-border/70 p-8 text-center text-sm text-muted-foreground dark:border-sidebar-border">
                        Nenhum agendamento para hoje.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {appointments.map((appointment) => {
                            const badge = statusBadge(appointment);

                            return (
                                <Panel key={appointment.id}>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                        <div className="w-14 shrink-0 text-center">
                                            <p className="font-semibold">{timeOf(appointment.starts_at)}</p>
                                            <p className="text-xs text-muted-foreground">{timeOf(appointment.ends_at)}</p>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">{appointment.client_name}</p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {appointment.service.name} · {formatPrice(appointment.service.price_cents)}
                                            </p>
                                        </div>

                                        <Badge className={badge.className}>{badge.label}</Badge>

                                        {appointment.status === 'confirmed' && (
                                            <div className="flex w-full shrink-0 justify-end gap-1 sm:w-auto">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    title="Marcar como concluído"
                                                    onClick={() => updateStatus(appointment, 'completed')}
                                                >
                                                    <Check className="h-4 w-4 text-(--green-500)" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    title="Marcar como não compareceu"
                                                    onClick={() => updateStatus(appointment, 'no_show')}
                                                >
                                                    <UserX className="h-4 w-4 text-(--red-500)" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    title="Cancelar agendamento"
                                                    onClick={() =>
                                                        confirm('Cancelar este agendamento? O cliente será avisado.') &&
                                                        router.post(
                                                            AppointmentCancellationController.url({
                                                                appointment: appointment.id,
                                                            }),
                                                            {},
                                                            { preserveScroll: true },
                                                        )
                                                    }
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Walk-in dialog */}
            <Dialog open={walkInOpen} onOpenChange={(open) => { setWalkInOpen(open); if (!open) setWalkInServiceId(''); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar encaixe</DialogTitle>
                        <DialogDescription>Registre um cliente que chegou sem agendamento.</DialogDescription>
                    </DialogHeader>

                    <Form
                        {...WalkInController.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setWalkInOpen(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-2">
                                    <Label>Serviço</Label>
                                    <Combobox
                                        options={serviceOptions}
                                        value={walkInServiceId}
                                        onValueChange={setWalkInServiceId}
                                        name="service_id"
                                        required
                                        placeholder="Selecione um serviço…"
                                        searchPlaceholder="Buscar serviço…"
                                    />
                                    <InputError message={errors.service_id} />
                                </div>

                                <input type="hidden" name="date" value={new Date().toISOString().slice(0, 10)} />

                                <div className="space-y-2">
                                    <Label htmlFor="walkin-time">Horário</Label>
                                    <Input
                                        id="walkin-time"
                                        name="time"
                                        type="time"
                                        required
                                        defaultValue={new Date().toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    />
                                    <InputError message={errors.time} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="walkin-name">Nome do cliente</Label>
                                    <Input id="walkin-name" name="client_name" required placeholder="Nome" />
                                    <InputError message={errors.client_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="walkin-phone">Telefone (opcional)</Label>
                                    <PhoneInput
                                        id="walkin-phone"
                                        name="client_phone"
                                        defaultCountry="BR"
                                        aria-invalid={errors.client_phone ? 'true' : undefined}
                                        aria-describedby={errors.client_phone ? 'walkin-phone-error' : undefined}
                                    />
                                    <InputError id="walkin-phone-error" message={errors.client_phone} />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Adicionar
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
