import { AsYouType, getExampleNumber, parsePhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type PhoneValue = {
    country: CountryCode;
    raw: string;
    e164: string;
    isValid: boolean;
};

export type UsePhoneInputOptions = {
    defaultCountry?: CountryCode;
    value?: string;
    onChange?: (value: PhoneValue) => void;
};

function formatWithMask(digits: string, country: CountryCode): string {
    return new AsYouType(country).input(digits);
}

function extractDigits(value: string): string {
    return value.replace(/\D/g, '');
}

function deriveE164(raw: string, country: CountryCode): string {
    try {
        const parsed = parsePhoneNumber(raw, country);
        return parsed.isValid() ? parsed.number : '';
    } catch {
        return '';
    }
}

function getPlaceholder(country: CountryCode): string {
    const example = getExampleNumber(country, examples as never);
    if (!example) return '';
    return example.formatNational();
}

function parseE164(e164: string): { country: CountryCode; raw: string } | null {
    try {
        const parsed = parsePhoneNumber(e164);
        if (!parsed.country) return null;
        return {
            country: parsed.country,
            raw: parsed.formatNational(),
        };
    } catch {
        return null;
    }
}

export function usePhoneInput({
    defaultCountry = 'BR',
    value,
    onChange,
}: UsePhoneInputOptions = {}) {
    const [country, setCountry] = useState<CountryCode>(defaultCountry);
    const [rawValue, setRawValue] = useState('');

    const e164 = useMemo(() => deriveE164(rawValue, country), [rawValue, country]);
    const isValid = e164 !== '';
    const placeholder = useMemo(() => getPlaceholder(country), [country]);

    useEffect(() => {
        if (!value) return;
        const parsed = parseE164(value);
        if (!parsed) return;
        setCountry(parsed.country);
        setRawValue(parsed.raw);
    }, [value]);

    const onCountryChange = useCallback(
        (nextCountry: CountryCode) => {
            const digits = extractDigits(rawValue);
            const newRaw = digits ? formatWithMask(digits, nextCountry) : '';
            setCountry(nextCountry);
            setRawValue(newRaw);
            const newE164 = deriveE164(newRaw, nextCountry);
            onChange?.({
                country: nextCountry,
                raw: newRaw,
                e164: newE164,
                isValid: newE164 !== '',
            });
        },
        [rawValue, onChange],
    );

    const onRawChange = useCallback(
        (input: string) => {
            const digits = extractDigits(input);
            const newRaw = digits ? formatWithMask(digits, country) : '';
            setRawValue(newRaw);
            const newE164 = deriveE164(newRaw, country);
            onChange?.({
                country,
                raw: newRaw,
                e164: newE164,
                isValid: newE164 !== '',
            });
        },
        [country, onChange],
    );

    return {
        country,
        rawValue,
        e164,
        isValid,
        placeholder,
        onCountryChange,
        onRawChange,
    };
}
