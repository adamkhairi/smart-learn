import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import ScrollToTop, { ScrollIndicator } from '@/components/scroll-to-top';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function PublicLayout({ children, title = 'SmartLearn' }: PublicLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={title} />

            {/* Header */}
            <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-[#0a0a0acc] border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link href={route('home')} className="flex items-center gap-2 text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            <AppLogo />
                        </Link>
                    </div>
                    <nav className="hidden items-center gap-8 text-sm lg:flex">
                        <Link href={route('courses.index')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Courses
                        </Link>
                        <Link href="#features" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Features
                        </Link>
                        <Link href="#testimonials" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Testimonials
                        </Link>
                        <Link href="#pricing" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Pricing
                        </Link>
                        <Link href={route('about')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            About
                        </Link>
                        <Link href={route('contact')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Contact
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4 text-sm">
                        <AppearanceToggleDropdown />
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg border border-[#19140035] px-4 py-2 font-medium text-[#1b1b18] hover:border-[#19140080] hover:bg-gray-50 dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] dark:hover:bg-gray-800 transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 font-medium text-[#1b1b18] hover:text-[#f53003] dark:text-[#EDEDEC] dark:hover:text-[#FF4433] transition-colors"
                                >
                                    Log&nbsp;in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-lg bg-[#f53003] px-6 py-2 font-medium text-white shadow-lg hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29] transition-all hover:shadow-xl"
                                >
                                    Get&nbsp;Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Scroll Indicator */}
            <ScrollIndicator />

            {/* Main content */}
            <main className="mt-20 bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] scroll-container">
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    {children}
                </div>
            </main>

            {/* Scroll to Top */}
            <ScrollToTop />

            {/* Footer */}
            <footer className="bg-[#FDFDFC] py-12 text-sm text-[#706f6c] dark:bg-[#0a0a0a] dark:text-[#A1A09A]">
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <AppLogo />
                            </div>
                            <p className="mb-4 text-sm leading-relaxed">
                                Empowering learners worldwide with interactive, personalized education experiences.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-4 font-medium">Product</h3>
                            <div className="space-y-2">
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Features</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Pricing</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Courses</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Certificates</Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-4 font-medium">Company</h3>
                            <div className="space-y-2">
                                <Link href={route('about')} className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">About</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Blog</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Careers</Link>
                                <Link href={route('contact')} className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Contact</Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="mb-4 font-medium">Support</h3>
                            <div className="space-y-2">
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Help Center</Link>
                                <Link href={route('privacy')} className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Privacy</Link>
                                <Link href={route('terms')} className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Terms</Link>
                                <Link href="#" className="block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">Status</Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
                        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                            <p>&copy; {new Date().getFullYear()} SmartLearn. All rights reserved.</p>
                            <div className="flex gap-4">
                                <Link href={route('privacy')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                    Privacy
                                </Link>
                                <Link href={route('terms')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                    Terms
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
