import type { CountryCode } from 'libphonenumber-js';
import type { ComponentProps } from 'react';

import { CountrySelector } from '@/components/ui/country-selector';
import { Input } from '@/components/ui/input';
import type { PhoneValue } from '@/hooks/use-phone-input';
import { usePhoneInput } from '@/hooks/use-phone-input';
import { cn } from '@/lib/utils';

export type { PhoneValue };

export type PhoneInputProps = {
    name?: string;
    countryName?: string;
    defaultCountry?: CountryCode;
    value?: string;
    onChange?: (value: PhoneValue) => void;
    disabled?: boolean;
    'aria-invalid'?: ComponentProps<'input'>['aria-invalid'];
    'aria-describedby'?: string;
    'aria-label'?: string;
    className?: string;
} & Omit<
    ComponentProps<'input'>,
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'aria-invalid'
    | 'aria-describedby'
    | 'aria-label'
>;

export default function PhoneInput({
    name,
    countryName,
    defaultCountry = 'BR',
    value,
    onChange,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    className,
    ...rest
}: PhoneInputProps) {
    const {
        country,
        rawValue,
        e164,
        placeholder,
        onCountryChange,
        onRawChange,
    } = usePhoneInput({ defaultCountry, value, onChange });

    return (
        <div data-slot="phone-input" className={cn('flex', className)}>
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={e164}
                    aria-hidden="true"
                />
            )}
            {countryName && (
                <input
                    type="hidden"
                    name={countryName}
                    value={country}
                    aria-hidden="true"
                />
            )}

            <CountrySelector
                value={country}
                onValueChange={onCountryChange}
                disabled={disabled}
                aria-labelledby={rest.id ? `${rest.id}-country-label` : undefined}
                className="rounded-r-none border-r-0"
            />

            <Input
                {...rest}
                type="tel"
                inputMode="tel"
                value={rawValue}
                onChange={(e) => onRawChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                aria-label={ariaLabel}
                className="flex-1 rounded-l-none"
            />
        </div>
    );
}
