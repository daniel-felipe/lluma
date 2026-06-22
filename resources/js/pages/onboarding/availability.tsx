import { Head, useForm } from '@inertiajs/react';
import BarberScheduleController from '@/actions/App/Http/Controllers/BarberScheduleController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Panel } from '@/components/ui/panel';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

type Day = {
    day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    is_open: boolean;
    opens_at: string | null;
    closes_at: string | null;
    break_starts_at: string | null;
    break_ends_at: string | null;
};

type ScheduleForm = {
    buffer_minutes: 0 | 5 | 10 | 15 | 30;
    days: Day[];
};

type Props = {
    schedule: ScheduleForm;
    is_onboarding: boolean;
    onboarding_step: string;
    steps: string[];
};

const DAY_NAMES: Record<number, string> = {
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
    7: 'Domingo',
};

const BUFFER_OPTIONS: { value: 0 | 5 | 10 | 15 | 30; label: string }[] = [
    { value: 0, label: 'Sem intervalo' },
    { value: 5, label: '5 min' },
    { value: 10, label: '10 min' },
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
];

function generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            times.push(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
            );
        }
    }
    return times;
}

const TIME_OPTIONS = generateTimeOptions();
const TIME_COMBOBOX_OPTIONS: ComboboxOption[] = TIME_OPTIONS.map((t) => ({ value: t, label: t }));

type DayRowProps = {
    day: Day;
    index: number;
    errors: Record<string, string>;
    onUpdate: (changes: Partial<Day>) => void;
};

function TimeSelect({
    label,
    value,
    onChange,
}: {
    id: string;
    label: string;
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    return (
        <Combobox
            options={TIME_COMBOBOX_OPTIONS}
            value={value ?? ''}
            onValueChange={(v) => onChange(v || null)}
            placeholder={label}
            searchPlaceholder="Buscar horário…"
            size="sm"
        />
    );
}

function DayRow({ day, index, errors, onUpdate }: DayRowProps) {
    const hasBreak = day.break_starts_at !== null || day.break_ends_at !== null;
    const dayName = DAY_NAMES[day.day_of_week];

    function toggleOpen() {
        if (day.is_open) {
            onUpdate({
                is_open: false,
                opens_at: null,
                closes_at: null,
                break_starts_at: null,
                break_ends_at: null,
            });
        } else {
            onUpdate({
                is_open: true,
                opens_at: '09:00',
                closes_at: '19:00',
            });
        }
    }

    function addBreak() {
        onUpdate({ break_starts_at: '12:00', break_ends_at: '13:00' });
    }

    function removeBreak() {
        onUpdate({ break_starts_at: null, break_ends_at: null });
    }

    return (
        <div className="border-b py-3 last:border-b-0">
            {/* Main row: toggle + day name + open/close times */}
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={day.is_open}
                        onClick={toggleOpen}
                        className={[
                            'relative inline-flex h-[18px] w-[34px] shrink-0 cursor-pointer rounded-full transition-colors',
                            day.is_open ? 'bg-foreground' : 'bg-muted',
                        ].join(' ')}
                    >
                        <span
                            className={[
                                'pointer-events-none absolute top-[3px] size-3 rounded-full bg-background shadow transition-transform',
                                day.is_open ? 'translate-x-[19px]' : 'translate-x-[3px]',
                            ].join(' ')}
                        />
                    </button>
                    <span
                        className={[
                            'w-14 text-sm font-bold',
                            day.is_open ? 'text-foreground' : 'text-muted-foreground',
                        ].join(' ')}
                    >
                        {dayName}
                    </span>
                </div>

                <div className="flex h-8 items-center pl-[46px] sm:pl-0">
                    {day.is_open ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                            <TimeSelect
                                id={`opens_at_${index}`}
                                label={`${dayName} abertura`}
                                value={day.opens_at}
                                onChange={(v) => onUpdate({ opens_at: v })}
                            />
                            <span className="text-xs text-muted-foreground">até</span>
                            <TimeSelect
                                id={`closes_at_${index}`}
                                label={`${dayName} fechamento`}
                                value={day.closes_at}
                                onChange={(v) => onUpdate({ closes_at: v })}
                            />
                        </div>
                    ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                            Fechado
                        </span>
                    )}
                </div>
            </div>

            <InputError message={errors[`days.${index}.opens_at`]} />
            <InputError message={errors[`days.${index}.closes_at`]} />

            {/* Break block */}
            {day.is_open && (
                <div className="mt-2 pl-0 sm:pl-[46px]">
                    {hasBreak ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">
                                    Pausa:
                                </span>
                                <TimeSelect
                                    id={`break_starts_at_${index}`}
                                    label={`${dayName} início da pausa`}
                                    value={day.break_starts_at}
                                    onChange={(v) =>
                                        onUpdate({ break_starts_at: v })
                                    }
                                />
                                <span className="text-xs text-muted-foreground">
                                    até
                                </span>
                                <TimeSelect
                                    id={`break_ends_at_${index}`}
                                    label={`${dayName} fim da pausa`}
                                    value={day.break_ends_at}
                                    onChange={(v) =>
                                        onUpdate({ break_ends_at: v })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={removeBreak}
                                    aria-label={`Remover pausa de ${dayName}`}
                                    className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                                >
                                    remover
                                </button>
                            </div>
                            <InputError
                                message={errors[`days.${index}.break_starts_at`]}
                            />
                            <InputError
                                message={errors[`days.${index}.break_ends_at`]}
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={addBreak}
                            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                            + adicionar pausa
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Availability({ schedule, steps, is_onboarding }: Props) {
    const stepIndex = steps.indexOf('availability');
    const progress = ((stepIndex + 1) / steps.length) * 100;

    const { data, setData, put, processing, errors } = useForm<ScheduleForm>({
        buffer_minutes: schedule.buffer_minutes,
        days: [...schedule.days].sort((a, b) => a.day_of_week - b.day_of_week),
    });

    function updateDay(index: number, changes: Partial<Day>): void {
        const updatedDays = data.days.map((day, i) =>
            i === index ? { ...day, ...changes } : day,
        );
        setData('days', updatedDays);
    }

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();
        put(BarberScheduleController.update.url());
    }

    const selectedBufferLabel =
        BUFFER_OPTIONS.find((o) => o.value === data.buffer_minutes)?.label ??
        'Sem intervalo';

    return (
        <AuthLayout
            title="Horário de funcionamento"
            description="Defina quando você atende."
        >
            <Head title="Disponibilidade" />

            <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                    Passo {stepIndex + 1} de {steps.length}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Days list */}
                <div>
                    {data.days.map((day, index) => (
                        <DayRow
                            key={day.day_of_week}
                            day={day}
                            index={index}
                            errors={errors}
                            onUpdate={(changes) => updateDay(index, changes)}
                        />
                    ))}
                </div>

                {/* Buffer row */}
                <Panel className="rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-bold">
                                Intervalo entre clientes
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tempo de preparo entre atendimentos
                            </p>
                        </div>
                        <Select
                            value={String(data.buffer_minutes)}
                            onValueChange={(v) =>
                                setData(
                                    'buffer_minutes',
                                    Number(v) as 0 | 5 | 10 | 15 | 30,
                                )
                            }
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-auto shrink-0"
                                aria-label="Intervalo entre clientes"
                            >
                                <SelectValue>{selectedBufferLabel}</SelectValue>
                            </SelectTrigger>
                            <SelectContent align="end" side="top">
                                {BUFFER_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={String(opt.value)}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <InputError message={errors.buffer_minutes} />
                </Panel>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing && <Spinner />}
                    {is_onboarding ? 'Concluir setup ✓' : 'Salvar alterações'}
                </Button>
            </form>
        </AuthLayout>
    );
}
