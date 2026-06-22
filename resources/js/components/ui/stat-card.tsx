import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: string | number;
    icon?: React.ElementType;
    className?: string;
};

export function StatCard({ label, value, icon: Icon, className }: Props) {
    return (
        <div
            className={cn(
                'bg-card text-card-foreground flex flex-col gap-2 rounded-xl border border-border p-4 shadow-[var(--shadow-1)]',
                className,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {label}
                </p>
                {Icon && <Icon className="size-4 text-muted-foreground/60" />}
            </div>
            <p className="font-display text-2xl font-bold tracking-tight tabular-nums text-foreground">
                {value}
            </p>
        </div>
    );
}
