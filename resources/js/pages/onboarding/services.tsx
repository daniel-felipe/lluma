import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Form, Head, router } from '@inertiajs/react';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import BarberScheduleController from '@/actions/App/Http/Controllers/BarberScheduleController';
import ServiceController from '@/actions/App/Http/Controllers/ServiceController';
import ServiceOrderController from '@/actions/App/Http/Controllers/ServiceOrderController';
import ServiceToggleController from '@/actions/App/Http/Controllers/ServiceToggleController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import CurrencyInput from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Toggle } from '@/components/ui/toggle';
import AuthLayout from '@/layouts/auth-layout';

type Service = {
    id: string;
    name: string;
    price_cents: number;
    duration_minutes: number;
    is_active: boolean;
    sort_order: number;
};

type ServiceTemplate = {
    name: string;
    price_cents: number;
    duration_minutes: number;
};

type Props = {
    services: Service[];
    templates: ServiceTemplate[] | null;
    is_onboarding: boolean;
    onboarding_step: string;
    steps: string[];
};

function formatPrice(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

type ServiceFormProps = {
    service?: Service;
    onCancel: () => void;
    onSuccess?: () => void;
};

function ServiceForm({ service, onCancel, onSuccess }: ServiceFormProps) {
    const isEdit = service !== undefined;
    const action = isEdit
        ? ServiceController.update(service.id)
        : ServiceController.store();

    const defaultPriceCents = isEdit ? service.price_cents : 0;

    return (
        <Form {...action} resetOnSuccess onSuccess={onSuccess} className="flex flex-col gap-4">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome do serviço</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={isEdit ? service.name : ''}
                            required
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="price_display">Preço</Label>
                            <CurrencyInput
                                id="price_display"
                                name="price_cents"
                                defaultValueCents={defaultPriceCents}
                                required
                            />
                            <InputError message={errors.price_cents} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="duration_minutes">
                                Duração (min)
                            </Label>
                            <Input
                                id="duration_minutes"
                                name="duration_minutes"
                                type="number"
                                min={1}
                                max={480}
                                defaultValue={
                                    isEdit ? service.duration_minutes : ''
                                }
                                required
                            />
                            <InputError message={errors.duration_minutes} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {isEdit ? 'Salvar alterações' : 'Adicionar serviço'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

type SortableServiceCardProps = {
    service: Service;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
};

function SortableServiceCard({
    service,
    onEdit,
    onDelete,
}: SortableServiceCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
        >
            <button
                type="button"
                className="cursor-grab touch-none text-muted-foreground"
                aria-label="Reordenar"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="size-5" />
            </button>

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">
                    {formatPrice(service.price_cents)} &middot;{' '}
                    {service.duration_minutes} min
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Form {...ServiceToggleController(service.id)}>
                    {({ processing }) => (
                        <Toggle
                            type="submit"
                            pressed={service.is_active}
                            aria-label={
                                service.is_active ? 'Desativar' : 'Ativar'
                            }
                            disabled={processing}
                            className="h-8 w-8 p-0"
                        >
                            <span
                                className={
                                    service.is_active
                                        ? 'text-green-600'
                                        : 'text-muted-foreground'
                                }
                            >
                                ●
                            </span>
                        </Toggle>
                    )}
                </Form>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Editar"
                    onClick={() => onEdit(service)}
                >
                    <Pencil className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    aria-label="Excluir"
                    onClick={() => onDelete(service)}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}

type DeleteDialogProps = {
    service: Service | null;
    onClose: () => void;
};

function DeleteDialog({ service, onClose }: DeleteDialogProps) {
    const isOpen = service !== null;

    function handleDelete(confirm: boolean) {
        if (!service) {
            return;
        }
        const url = confirm
            ? ServiceController.destroy.url(service.id) + '?confirm=1'
            : ServiceController.destroy.url(service.id);
        router.delete(url, { onFinish: onClose });
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Excluir serviço</DialogTitle>
                    <DialogDescription>
                        Tem certeza que deseja excluir{' '}
                        <strong>{service?.name}</strong>? Esta ação não pode ser
                        desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleDelete(false)}
                    >
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Services({
    services: initialServices,
    templates,
    steps,
}: Props) {
    const [services, setServices] = useState(initialServices);

    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingService, setDeletingService] = useState<Service | null>(
        null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const stepIndex = steps.indexOf('services');
    const progress = ((stepIndex + 1) / steps.length) * 100;

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = services.findIndex((s) => s.id === active.id);
        const newIndex = services.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = [...services];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        setServices(reordered);

        router.patch(
            ServiceOrderController.url(),
            { order: reordered.map((s) => s.id) },
            {
                preserveScroll: true,
                onError: () => setServices(services),
            },
        );
    }

    function handleTemplateClick(template: ServiceTemplate) {
        router.post(
            ServiceController.store.url(),
            {
                name: template.name,
                price_cents: template.price_cents,
                duration_minutes: template.duration_minutes,
            },
            { preserveScroll: true },
        );
    }

    const isEditing = editingService !== null;

    return (
        <AuthLayout
            title="Seus serviços"
            description="Adicione os serviços que você oferece"
        >
            <Head title="Serviços" />

            <div className="mb-6">
                <Progress value={progress} className="h-2" />
                <p className="mt-1 text-xs text-muted-foreground">
                    Passo {stepIndex + 1} de {steps.length}
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Template suggestions (only shown when no services yet) */}
                {templates !== null && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium">
                            Comece com um modelo:
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {templates.map((template) => (
                                <button
                                    key={template.name}
                                    type="button"
                                    onClick={() =>
                                        handleTemplateClick(template)
                                    }
                                    className="flex flex-col gap-1 rounded-lg border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
                                >
                                    <span className="font-medium">
                                        {template.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatPrice(template.price_cents)}{' '}
                                        &middot; {template.duration_minutes} min
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Service list with drag-and-drop */}
                {services.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={services.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-2">
                                {services.map((service) => (
                                    <SortableServiceCard
                                        key={service.id}
                                        service={service}
                                        onEdit={(s) => {
                                            setEditingService(s);
                                            setShowAddForm(false);
                                        }}
                                        onDelete={setDeletingService}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Edit form (inline) */}
                {isEditing && (
                    <Panel className="rounded-lg gap-4">
                        <p className="text-sm font-medium">
                            Editar serviço
                        </p>
                        <ServiceForm
                            service={editingService}
                            onCancel={() => setEditingService(null)}
                        />
                    </Panel>
                )}

                {/* Add service form */}
                {!isEditing && (
                    <>
                        {showAddForm ? (
                            <Panel className="rounded-lg gap-4">
                                <p className="text-sm font-medium">
                                    Novo serviço
                                </p>
                                <ServiceForm
                                    onCancel={() => setShowAddForm(false)}
                                    onSuccess={() => setShowAddForm(false)}
                                />
                            </Panel>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowAddForm(true)}
                            >
                                + Adicionar serviço
                            </Button>
                        )}
                    </>
                )}

                {/* Continue button (only during onboarding, when at least one service exists) */}
                {services.length > 0 && (
                    <Button
                        type="button"
                        className="w-full"
                        onClick={() =>
                            router.get(BarberScheduleController.show.url())
                        }
                    >
                        Continuar
                    </Button>
                )}
            </div>

            <DeleteDialog
                service={deletingService}
                onClose={() => setDeletingService(null)}
            />
        </AuthLayout>
    );
}
