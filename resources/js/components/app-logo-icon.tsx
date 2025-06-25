import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Graduation cap */}
            <path d="M12 2L1 7l4 2.18v6L12 18l7-2.82v-6L23 7l-11-5z" />
            <path d="M5 13.18v4L12 20l7-2.82v-4l-7 2.82-7-2.82z" opacity="0.7" />
            {/* Book/learning element */}
            <rect x="8" y="11" width="8" height="1" rx="0.5" opacity="0.8" />
            <rect x="8" y="13" width="6" height="1" rx="0.5" opacity="0.6" />
            <rect x="8" y="15" width="4" height="1" rx="0.5" opacity="0.4" />
        </svg>
    );
}
