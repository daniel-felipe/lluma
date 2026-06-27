import { useEffect, useMemo, useState, type ComponentProps } from 'react';

import { Input } from '@/components/ui/input';

export type CurrencyInputProps = {
    name?: string;
    defaultValueCents?: number;
    value?: number;
    onValueChange?: (cents: number) => void;
    locale?: string;
    currency?: string;
} & Omit<
    ComponentProps<'input'>,
    'name' | 'value' | 'defaultValue' | 'onChange' | 'type'
>;

function formatCents(cents: number, locale: string, currency: string): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

function digitsToCents(input: string): number {
    const digits = input.replace(/\D/g, '');
    if (digits === '') {
        return 0;
    }
    return parseInt(digits, 10);
}

export default function CurrencyInput({
    name,
    defaultValueCents = 0,
    value,
    onValueChange,
    locale = 'pt-BR',
    currency = 'BRL',
    placeholder = 'R$ 0,00',
    inputMode = 'numeric',
    ...rest
}: CurrencyInputProps) {
    const isControlled = value !== undefined;
    const [internalCents, setInternalCents] = useState(defaultValueCents);
    const cents = isControlled ? value : internalCents;

    useEffect(() => {
        if (!isControlled) {
            setInternalCents(defaultValueCents);
        }
    }, [defaultValueCents, isControlled]);

    const display = useMemo(
        () => (cents === 0 ? '' : formatCents(cents, locale, currency)),
        [cents, locale, currency],
    );

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextCents = digitsToCents(event.target.value);
        if (!isControlled) {
            setInternalCents(nextCents);
        }
        onValueChange?.(nextCents);
    }

    return (
        <>
            <Input
                {...rest}
                type="text"
                inputMode={inputMode}
                value={display}
                onChange={handleChange}
                placeholder={placeholder}
            />
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={cents === 0 ? '' : String(cents)}
                    aria-hidden="true"
                />
            )}
        </>
    );
}
