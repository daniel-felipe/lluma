import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CountrySelector } from '@/components/ui/country-selector';
import PhoneInput from '@/components/phone-input';
import { buildFlagEmoji, COUNTRIES } from '@/lib/phone-countries';
import { renderHook, act } from '@testing-library/react';
import { usePhoneInput } from '@/hooks/use-phone-input';

afterEach(cleanup);

// ---------------------------------------------------------------------------
// phone-countries.ts
// ---------------------------------------------------------------------------

describe('phone-countries', () => {
    it('Brazil is first', () => {
        expect(COUNTRIES[0].iso2).toBe('BR');
    });

    it('every entry has a non-empty flag', () => {
        COUNTRIES.forEach((c) => {
            expect(c.flag.length).toBeGreaterThan(0);
        });
    });

    it('every dial code starts with +', () => {
        COUNTRIES.forEach((c) => {
            expect(c.dialCode).toMatch(/^\+\d+/);
        });
    });

    it('buildFlagEmoji produces correct emoji for BR', () => {
        expect(buildFlagEmoji('BR')).toBe('🇧🇷');
    });

    it('buildFlagEmoji produces correct emoji for US', () => {
        expect(buildFlagEmoji('US')).toBe('🇺🇸');
    });

    it('every country has a string name', () => {
        COUNTRIES.forEach((c) => {
            expect(typeof c.name).toBe('string');
            expect(c.name.length).toBeGreaterThan(0);
        });
    });
});

// ---------------------------------------------------------------------------
// usePhoneInput hook
// ---------------------------------------------------------------------------

describe('usePhoneInput', () => {
    it('initializes with BR defaults', () => {
        const { result } = renderHook(() => usePhoneInput({}));
        expect(result.current.country).toBe('BR');
        expect(result.current.rawValue).toBe('');
        expect(result.current.e164).toBe('');
        expect(result.current.isValid).toBe(false);
    });

    it('formats Brazilian number as user types', () => {
        const { result } = renderHook(() => usePhoneInput({}));
        act(() => {
            result.current.onRawChange('31999990000');
        });
        expect(result.current.rawValue).toBe('(31) 99999-0000');
    });

    it('produces E.164 for a complete Brazilian number', () => {
        const { result } = renderHook(() => usePhoneInput({}));
        act(() => {
            result.current.onRawChange('31999990000');
        });
        expect(result.current.e164).toBe('+5531999990000');
        expect(result.current.isValid).toBe(true);
    });

    it('does not produce E.164 for a partial number', () => {
        const { result } = renderHook(() => usePhoneInput({}));
        act(() => {
            result.current.onRawChange('3199');
        });
        expect(result.current.e164).toBe('');
        expect(result.current.isValid).toBe(false);
    });

    it('placeholder is country-specific', () => {
        const { result: brResult } = renderHook(() =>
            usePhoneInput({ defaultCountry: 'BR' }),
        );
        const { result: usResult } = renderHook(() =>
            usePhoneInput({ defaultCountry: 'US' }),
        );
        expect(brResult.current.placeholder).not.toBe('');
        expect(usResult.current.placeholder).not.toBe('');
        expect(brResult.current.placeholder).not.toBe(usResult.current.placeholder);
    });

    it('country change re-formats digits', () => {
        const { result } = renderHook(() => usePhoneInput({}));
        act(() => {
            result.current.onRawChange('2015550123');
        });
        act(() => {
            result.current.onCountryChange('US');
        });
        expect(result.current.country).toBe('US');
        expect(result.current.rawValue).not.toBe('');
    });

    it('controlled value initializes country and rawValue from E.164', async () => {
        const { result } = renderHook(() =>
            usePhoneInput({ value: '+5531999990000' }),
        );
        await waitFor(() => {
            expect(result.current.country).toBe('BR');
            expect(result.current.rawValue).toBe('(31) 99999-0000');
            expect(result.current.isValid).toBe(true);
        });
    });

    it('fires onChange callback on raw change', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => usePhoneInput({ onChange }));
        act(() => {
            result.current.onRawChange('31999990000');
        });
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                e164: '+5531999990000',
                isValid: true,
                country: 'BR',
            }),
        );
    });

    it('fires onChange callback on country change', () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => usePhoneInput({ onChange }));
        act(() => {
            result.current.onCountryChange('US');
        });
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ country: 'US' }),
        );
    });
});

// ---------------------------------------------------------------------------
// CountrySelector component
// ---------------------------------------------------------------------------

describe('CountrySelector', () => {
    it('renders trigger with selected country flag and dial code', () => {
        render(
            <CountrySelector value="BR" onValueChange={() => {}} />,
        );
        expect(screen.getByText('+55')).toBeInTheDocument();
        expect(screen.getByText('🇧🇷')).toBeInTheDocument();
    });

    it('opens dropdown on click', async () => {
        const user = userEvent.setup();
        render(<CountrySelector value="BR" onValueChange={() => {}} />);
        await user.click(screen.getByRole('button'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes on Escape key', async () => {
        const user = userEvent.setup();
        render(<CountrySelector value="BR" onValueChange={() => {}} />);
        await user.click(screen.getByRole('button'));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('filters countries by search', async () => {
        const user = userEvent.setup();
        render(<CountrySelector value="BR" onValueChange={() => {}} />);
        await user.click(screen.getByRole('button'));
        await user.type(screen.getByPlaceholderText('Buscar país…'), 'Bras');
        const options = screen.getAllByRole('option');
        expect(options.some((o) => o.textContent?.includes('Brasil'))).toBe(true);
        expect(options.every((o) => o.textContent?.toLowerCase().includes('bras'))).toBe(true);
    });

    it('calls onValueChange when country is selected', async () => {
        const onValueChange = vi.fn();
        const user = userEvent.setup();
        render(<CountrySelector value="BR" onValueChange={onValueChange} />);
        await user.click(screen.getByRole('button'));
        await user.type(screen.getByPlaceholderText('Buscar país…'), 'Estados Unidos');
        const usOption = screen.getByRole('option', { name: /estados unidos/i });
        fireEvent.mouseDown(usOption);
        expect(onValueChange).toHaveBeenCalledWith('US');
    });

    it('keyboard navigation with ArrowDown selects via Enter', async () => {
        const onValueChange = vi.fn();
        const user = userEvent.setup();
        render(<CountrySelector value="BR" onValueChange={onValueChange} />);
        await user.click(screen.getByRole('button'));
        const search = screen.getByPlaceholderText('Buscar país…');
        await user.type(search, 'Brasil');
        await user.keyboard('{ArrowDown}');
        await user.keyboard('{Enter}');
        expect(onValueChange).toHaveBeenCalledWith('BR');
    });

    it('is disabled when disabled prop is set', async () => {
        render(
            <CountrySelector value="BR" onValueChange={() => {}} disabled />,
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });
});

// ---------------------------------------------------------------------------
// PhoneInput component
// ---------------------------------------------------------------------------

describe('PhoneInput', () => {
    it('renders country selector and phone input', () => {
        render(<PhoneInput />);
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('hidden input carries E.164 after valid number', async () => {
        const user = userEvent.setup();
        render(<PhoneInput name="phone" defaultCountry="BR" />);
        const input = screen.getByRole('textbox');
        await user.type(input, '31999990000');
        const hidden = document.querySelector('input[type="hidden"][name="phone"]') as HTMLInputElement;
        expect(hidden?.value).toBe('+5531999990000');
    });

    it('hidden country input carries ISO2 code', async () => {
        render(<PhoneInput name="phone" countryName="country" defaultCountry="BR" />);
        const hidden = document.querySelector('input[type="hidden"][name="country"]') as HTMLInputElement;
        expect(hidden?.value).toBe('BR');
    });

    it('aria-invalid propagates to the text input', () => {
        render(<PhoneInput aria-invalid="true" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('disabled prop disables both country button and text input', () => {
        render(<PhoneInput disabled />);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('formats number as user types', async () => {
        const user = userEvent.setup();
        render(<PhoneInput defaultCountry="BR" />);
        const input = screen.getByRole('textbox');
        await user.type(input, '31999990000');
        expect(input).toHaveValue('(31) 99999-0000');
    });

    it('does not lose focus on country change', async () => {
        const user = userEvent.setup();
        render(<PhoneInput name="phone" defaultCountry="BR" />);
        const textInput = screen.getByRole('textbox');
        await user.click(textInput);
        await user.type(textInput, '1234');

        const countryButton = screen.getByRole('button');
        await user.click(countryButton);
        await user.type(screen.getByPlaceholderText('Buscar país…'), 'Estados Unidos');
        const usOption = screen.getByRole('option', { name: /estados unidos/i });
        fireEvent.mouseDown(usOption);

        expect(document.activeElement).not.toBe(countryButton);
    });

    it('fires onChange with PhoneValue shape', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<PhoneInput defaultCountry="BR" onChange={onChange} />);
        await user.type(screen.getByRole('textbox'), '31999990000');
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                country: 'BR',
                e164: '+5531999990000',
                isValid: true,
            }),
        );
    });
});
