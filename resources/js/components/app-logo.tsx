import { useAppearance } from '@/hooks/use-appearance';
import { useEffect, useState } from 'react';

export default function AppLogo({ forceWhite = false, icon = false }: { forceWhite?: boolean; icon?: boolean } = {}) {
    const { appearance } = useAppearance();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const updateTheme = () => {
            // Check if dark class is present on html element
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        };

        // Update immediately
        updateTheme();

        // Listen for theme changes using MutationObserver
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [appearance]);

    if (icon) {
        return (
            <img src="/favicon.svg" alt="Smart Learn Icon" className="w-8 h-8" />
        );
    }

    const logoSrc = forceWhite ? '/logo-white.svg' : (isDark ? '/logo-white.svg' : '/logo-black.svg');

    return (
        <div className="">
            <img src={logoSrc} alt="Smart Learn Logo" className="w-48" />
        </div>
    );
}
