import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CurrencyInput from '@/components/ui/currency-input';

afterEach(cleanup);

function brl(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(cents / 100);
}

function hidden(name: string): HTMLInputElement {
    return document.querySelector(
        `input[type="hidden"][name="${name}"]`,
    ) as HTMLInputElement;
}

describe('CurrencyInput', () => {
    it('renders empty with placeholder and no hidden value', () => {
        render(<CurrencyInput name="price_cents" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('');
        expect(hidden('price_cents')?.value).toBe('');
    });

    it('masks digits as BRL currency from cents up', async () => {
        const user = userEvent.setup();
        render(<CurrencyInput name="price_cents" />);
        const input = screen.getByRole('textbox');
        await user.type(input, '4500');
        expect(input).toHaveValue(brl(4500));
        expect(hidden('price_cents')?.value).toBe('4500');
    });

    it('treats first digits as cents (12 -> R$ 0,12)', async () => {
        const user = userEvent.setup();
        render(<CurrencyInput name="price_cents" />);
        const input = screen.getByRole('textbox');
        await user.type(input, '12');
        expect(input).toHaveValue(brl(12));
        expect(hidden('price_cents')?.value).toBe('12');
    });

    it('initializes from defaultValueCents', () => {
        render(<CurrencyInput name="price_cents" defaultValueCents={3500} />);
        expect(screen.getByRole('textbox')).toHaveValue(brl(3500));
        expect(hidden('price_cents')?.value).toBe('3500');
    });

    it('fires onValueChange with integer cents', async () => {
        const onValueChange = vi.fn();
        const user = userEvent.setup();
        render(<CurrencyInput onValueChange={onValueChange} />);
        await user.type(screen.getByRole('textbox'), '999');
        expect(onValueChange).toHaveBeenLastCalledWith(999);
    });

    it('ignores non-digit input', async () => {
        const user = userEvent.setup();
        render(<CurrencyInput name="price_cents" />);
        const input = screen.getByRole('textbox');
        await user.type(input, 'abc25xyz');
        expect(input).toHaveValue(brl(25));
        expect(hidden('price_cents')?.value).toBe('25');
    });
});
