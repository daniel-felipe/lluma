import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export type { CountryCode };

export type CountryEntry = {
    iso2: CountryCode;
    name: string;
    flag: string;
    dialCode: string;
    priority: number;
};

export function buildFlagEmoji(iso2: string): string {
    return [...iso2.toUpperCase()]
        .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
        .join('');
}

function buildCountries(): CountryEntry[] {
    const displayNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

    const entries: CountryEntry[] = getCountries().map((iso2) => ({
        iso2,
        name: displayNames.of(iso2) ?? iso2,
        flag: buildFlagEmoji(iso2),
        dialCode: `+${getCountryCallingCode(iso2)}`,
        priority: iso2 === 'BR' ? 0 : 1,
    }));

    const collator = new Intl.Collator('pt-BR');

    return entries.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return collator.compare(a.name, b.name);
    });
}

export const COUNTRIES: CountryEntry[] = buildCountries();

export const COUNTRY_MAP: Map<CountryCode, CountryEntry> = new Map(
    COUNTRIES.map((c) => [c.iso2, c]),
);

export function getCountryEntry(iso2: CountryCode): CountryEntry | undefined {
    return COUNTRY_MAP.get(iso2);
}
