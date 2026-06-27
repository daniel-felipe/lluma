import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lluma">
            <rect width="64" height="64" rx="16" fill="#15130F" />
            <circle cx="19.5" cy="20" r="3.1" fill="#FAF7F2" />
            <rect x="27.5" y="16.9" width="21" height="6.2" rx="3.1" fill="#FAF7F2" />
            <circle cx="19.5" cy="32" r="3.1" fill="#E5A658" />
            <rect x="27.5" y="28.9" width="21" height="6.2" rx="3.1" fill="#E5A658" />
            <circle cx="19.5" cy="44" r="3.1" fill="#FAF7F2" />
            <rect x="27.5" y="40.9" width="13" height="6.2" rx="3.1" fill="#FAF7F2" />
        </svg>
    );
}
