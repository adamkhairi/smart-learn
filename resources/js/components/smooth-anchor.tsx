import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface SmoothAnchorProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    offset?: number;
    behavior?: ScrollBehavior;
}

export default function SmoothAnchor({
    href,
    children,
    className,
    offset = 80, // Default offset for fixed header
    behavior = 'smooth'
}: SmoothAnchorProps) {
        const handleClick = (e: React.MouseEvent<Element>) => {
        // Only handle anchor links
        if (!href.startsWith('#')) return;

        e.preventDefault();

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior,
            });
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={cn(className)}
        >
            {children}
        </Link>
    );
}

// Hook for smooth scrolling to anchor links
export function useSmoothScroll() {
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLAnchorElement;

            if (target.hash && target.origin === window.location.origin) {
                e.preventDefault();

                const targetId = target.hash.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    const offset = 80; // Account for fixed header
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                    });
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
        };
    }, []);
}

// Component for scroll-to-section functionality
export function ScrollToSection({
    sectionId,
    children,
    className,
    offset = 80
}: {
    sectionId: string;
    children: React.ReactNode;
    className?: string;
    offset?: number;
}) {
    const scrollToSection = () => {
        const section = document.getElementById(sectionId);

        if (section) {
            const elementPosition = section.offsetTop;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <button
            onClick={scrollToSection}
            className={cn(className)}
        >
            {children}
        </button>
    );
}
