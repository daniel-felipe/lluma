import { Form, Head } from '@inertiajs/react';
import { Calendar, ChevronLeft, Clock, MapPin, Scissors } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AvailabilityController from '@/actions/App/Http/Controllers/AvailabilityController';
import BookingController from '@/actions/App/Http/Controllers/BookingController';
import InputError from '@/components/input-error';
import PhoneInput from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type BookingService = {
    id: string;
    name: string;
    price_cents: number;
    duration_minutes: number;
};

type Props = {
    barber: {
        slug: string;
        business_name: string;
        profile_photo_url: string | null;
        cover_photo_url: string | null;
        address: string;
    };
    services: BookingService[];
    open_days: number[];
};

function formatPrice(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function BookingShow({ barber, services, open_days }: Props) {
    // Rescheduling flow preselects the previous service via ?service=UUID
    const [selectedService, setSelectedService] = useState<BookingService | null>(() => {
        const preselected = new URLSearchParams(window.location.search).get('service');

        return services.find((service) => service.id === preselected) ?? null;
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const days = useMemo(() => {
        const result: { date: string; weekday: string; day: number; isOpen: boolean }[] = [];

        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);

            // ISO day of week: 1=Mon … 7=Sun
            const isoDay = date.getDay() === 0 ? 7 : date.getDay();

            result.push({
                date: toDateString(date),
                weekday: i === 0 ? 'Hoje' : WEEKDAY_LABELS[date.getDay()],
                day: date.getDate(),
                isOpen: open_days.includes(isoDay),
            });
        }

        return result;
    }, [open_days]);

    const fetchSlots = useCallback(
        async (serviceId: string, date: string) => {
            setLoadingSlots(true);
            setSlots([]);

            try {
                const url = AvailabilityController.url({ barberProfile: barber.slug });
                const response = await fetch(`${url}?service_id=${serviceId}&date=${date}`, {
                    headers: { Accept: 'application/json' },
                });
                const data = (await response.json()) as { slots?: string[] };

                setSlots(data.slots ?? []);
            } catch {
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        },
        [barber.slug],
    );

    useEffect(() => {
        if (selectedService && selectedDate) {
            setSelectedTime(null);
            void fetchSlots(selectedService.id, selectedDate);
        }
    }, [selectedService, selectedDate, fetchSlots]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={barber.business_name} />

            {/* Header */}
            <div className="relative h-44 bg-[#15130F]">
                {barber.cover_photo_url && (
                    <img src={barber.cover_photo_url} alt="" className="h-full w-full object-cover" />
                )}
            </div>

            <div className="mx-auto max-w-md px-4 pb-24">
                <div className="relative z-10 -mt-12 mb-6 flex flex-col items-center gap-3 text-center">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-accent shadow-lg">
                        {barber.profile_photo_url ? (
                            <img src={barber.profile_photo_url} alt={barber.business_name} className="h-full w-full object-cover" />
                        ) : (
                            <Scissors className="h-10 w-10 text-primary" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{barber.business_name}</h1>
                        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {barber.address}
                        </p>
                    </div>
                </div>

                {/* Step 1: Service */}
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Escolha o serviço</h2>
                <div className="mb-6 space-y-2">
                    {services.length === 0 && (
                        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                            Nenhum serviço disponível no momento.
                        </p>
                    )}
                    {services.map((service) => (
                        <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedService(service)}
                            className={`flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left transition ${
                                selectedService?.id === service.id
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-border hover:border-muted-foreground'
                            }`}
                        >
                            <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {service.duration_minutes} min
                                </p>
                            </div>
                            <span className="font-semibold text-primary">{formatPrice(service.price_cents)}</span>
                        </button>
                    ))}
                </div>

                {/* Step 2: Date */}
                {selectedService && (
                    <>
                        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Escolha o dia</h2>
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                            {days.map((day) => (
                                <button
                                    key={day.date}
                                    type="button"
                                    disabled={!day.isOpen}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`flex min-w-14 flex-col items-center rounded-sm border px-3 py-2 transition disabled:opacity-35 ${
                                        selectedDate === day.date
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card hover:border-muted-foreground'
                                    }`}
                                >
                                    <span className="text-xs">{day.weekday}</span>
                                    <span className="text-lg font-semibold">{day.day}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Step 3: Time */}
                {selectedService && selectedDate && (
                    <>
                        <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Escolha o horário</h2>
                        {loadingSlots ? (
                            <div className="mb-6 flex justify-center py-6">
                                <Spinner className="h-6 w-6" />
                            </div>
                        ) : slots.length === 0 ? (
                            <p className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                                Nenhum horário disponível neste dia. Tente outra data.
                            </p>
                        ) : (
                            <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {slots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        className={`min-h-11 rounded-sm border py-2 text-sm font-medium transition ${
                                            selectedTime === time
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card hover:border-muted-foreground'
                                        }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Step 4: Client details + confirm */}
                {selectedService && selectedDate && selectedTime && (
                    <Form
                        action={BookingController.store.url({ barberProfile: barber.slug })}
                        method="post"
                        transform={(data) => ({
                            ...data,
                            service_id: selectedService.id,
                            date: selectedDate,
                            time: selectedTime,
                        })}
                        className="space-y-4 rounded-xl border border-border bg-card p-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Seus dados</h2>

                                <div className="space-y-2">
                                    <Label htmlFor="client_name">Nome</Label>
                                    <Input id="client_name" name="client_name" required placeholder="Seu nome" />
                                    <InputError message={errors.client_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client_phone">WhatsApp</Label>
                                    <PhoneInput
                                        id="client_phone"
                                        name="client_phone"
                                        required
                                    />
                                    <InputError message={errors.client_phone} />
                                </div>

                                <InputError message={errors.service_id} />
                                <InputError message={errors.date} />
                                <InputError message={errors.time} />

                                <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                                    </span>
                                    <span className="font-semibold">{formatPrice(selectedService.price_cents)}</span>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? <Spinner className="h-4 w-4" /> : 'Confirmar agendamento'}
                                </Button>
                            </>
                        )}
                    </Form>
                )}

                {(selectedService || selectedDate) && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedService(null);
                            setSelectedDate(null);
                            setSelectedTime(null);
                        }}
                        className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" /> Recomeçar
                    </button>
                )}
            </div>
        </div>
    );
}
