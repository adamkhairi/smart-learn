import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Home, Search, BookOpen, HelpCircle } from 'lucide-react';

export default function NotFound() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Page Not Found – SmartLearn" />

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

            {/* Main content */}
            <main className="mt-20 flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
                    {/* 404 Illustration */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                <span className="text-6xl font-bold text-[#f53003] dark:text-[#FF4433]">404</span>
                            </div>
                            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f53003] text-sm font-medium text-white dark:bg-[#FF4433]">
                                ?
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
                        Page Not Found
                    </h1>
                    <p className="mb-8 text-lg text-[#706f6c] dark:text-[#A1A09A]">
                        Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                    </p>

                    {/* Quick Actions */}
                    <div className="mb-12 grid gap-4 sm:grid-cols-2">
                        <Link
                            href={route('home')}
                            className="group flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] bg-white p-4 shadow-sm transition-all hover:border-[#f53003]/20 hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                        >
                            <Home className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                            <span className="font-medium">Go Home</span>
                        </Link>
                        <Link
                            href={route('courses.index')}
                            className="group flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] bg-white p-4 shadow-sm transition-all hover:border-[#f53003]/20 hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                        >
                            <BookOpen className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                            <span className="font-medium">Browse Courses</span>
                        </Link>
                    </div>

                    {/* Search Suggestion */}
                    <div className="mb-8 rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-3 text-lg font-semibold">Looking for something specific?</h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Try searching for courses, topics, or use the navigation menu above to find what you're looking for.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="flex-1 rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:focus:border-[#FF4433]"
                            />
                            <button className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]">
                                <Search className="h-4 w-4" />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <h2 className="mb-3 text-lg font-semibold">Need Help?</h2>
                        <p className="mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            If you're having trouble finding what you're looking for, our support team is here to help.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link
                                href={route('contact')}
                                className="group inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2 text-sm font-medium text-white hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29] transition-all"
                            >
                                <HelpCircle className="h-4 w-4" />
                                Contact Support
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="#"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e0] px-6 py-2 text-sm font-medium hover:border-[#f53003]/20 dark:border-[#3E3E3A] dark:hover:border-[#FF4433]/20 transition-all"
                            >
                                Help Center
                            </Link>
                        </div>
                    </div>

                    {/* Popular Pages */}
                    <div className="mt-8">
                        <h3 className="mb-4 text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Popular Pages</h3>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link href={route('about')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                About Us
                            </Link>
                            <Link href={route('privacy')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href={route('terms')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                Terms of Service
                            </Link>
                            <Link href={route('contact')} className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

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
