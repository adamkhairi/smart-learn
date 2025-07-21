import { Link, usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import SmoothAnchor from '@/components/smooth-anchor';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';

interface NavigationItem {
    label: string;
    href: string;
    isExternal?: boolean;
    isSmooth?: boolean;
}

interface HeaderProps {
    navigationItems?: NavigationItem[];
    showLogo?: boolean;
    className?: string;
}

const defaultNavigationItems: NavigationItem[] = [
    { label: 'Courses', href: 'courses.index' },
    { label: 'Features', href: '#features', isSmooth: true },
    { label: 'Testimonials', href: '#testimonials', isSmooth: true },
    { label: 'Pricing', href: '#pricing', isSmooth: true },
    { label: 'About', href: 'about' },
    { label: 'Contact', href: 'contact' },
];

export default function Header({
    navigationItems = defaultNavigationItems,
    showLogo = true,
    className = ""
}: HeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const renderNavigationItem = (item: NavigationItem, index: number) => {
        const baseClasses = "hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors";

        if (item.isSmooth) {
            return (
                <SmoothAnchor
                    key={index}
                    href={item.href}
                    className={baseClasses}
                >
                    {item.label}
                </SmoothAnchor>
            );
        }

        if (item.isExternal) {
            return (
                <a
                    key={index}
                    href={item.href}
                    className={baseClasses}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.label}
                </a>
            );
        }

        return (
            <Link
                key={index}
                href={route(item.href)}
                className={baseClasses}
            >
                {item.label}
            </Link>
        );
    };

    return (
        <header className={`fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-[#0a0a0acc] border-b border-gray-200/50 dark:border-gray-800/50 ${className}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
                {/* Logo */}
                {showLogo && (
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-2 text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC] hover:opacity-80 transition-opacity"
                        >
                            <AppLogo />
                        </Link>
                    </div>
                )}

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 text-sm lg:flex">
                    {navigationItems.map(renderNavigationItem)}
                </nav>


                {/* Mobile Menu Button - TODO: Implement mobile menu */}
                <div className="lg:hidden">
                    {/* Mobile menu button can be added here */}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4 text-sm">
                    {/* Appearance Toggle */}
                    <AppearanceToggleDropdown />

                    {/* Authentication */}
                    {auth?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-[#1b1b18] hover:border-[#19140080] hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] dark:hover:bg-gray-800 transition-all">
                                    <Avatar className="size-6 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.photo} alt={auth.user.name} />
                                        <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{auth.user.name}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="px-4 py-2 font-medium text-[#1b1b18] hover:text-[#f53003] dark:text-[#EDEDEC] dark:hover:text-[#FF4433] transition-colors"
                            >
                                Log&nbsp;in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
