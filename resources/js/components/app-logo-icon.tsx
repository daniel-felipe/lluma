import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="64" height="64" rx="14" fill="#15130F" />
            <g>
                <rect x="14" y="12" width="4" height="40" transform="rotate(20 16 32)" fill="#FAF7F2" />
                <rect x="22" y="12" width="4" height="40" transform="rotate(20 24 32)" fill="#B86F1F" />
                <rect x="30" y="12" width="4" height="40" transform="rotate(20 32 32)" fill="#FAF7F2" />
                <rect x="38" y="12" width="4" height="40" transform="rotate(20 40 32)" fill="#B86F1F" />
                <rect x="46" y="12" width="4" height="40" transform="rotate(20 48 32)" fill="#FAF7F2" />
            </g>
        </svg>
    );
}
