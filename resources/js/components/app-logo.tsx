import { useAppearance } from '@/hooks/use-appearance';

export default function AppLogo() {
    const theme = useAppearance();
    const logoSrc = theme.appearance === 'dark' ? '/logo-white.svg' : theme.appearance === 'light' ? '/logo-black.svg' : '/logo-white.svg';
    return (
        <div className="flex items-center justify-center">
            <img src={logoSrc} alt="Smart Learn Logo" className="w-56" />
        </div>
    );
}
