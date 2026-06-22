import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: React.ReactNode;
    className?: string;
};

export function Panel({ children, className }: Props) {
    return (
        <div
            className={cn(
                'bg-card text-card-foreground flex flex-col gap-2 rounded-xl border border-border p-4 shadow-[var(--shadow-1)]',
                className,
            )}
        >
            {children}
        </div>
    );
}
