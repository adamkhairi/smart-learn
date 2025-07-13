import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Search, HelpCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <PublicLayout title="Page Not Found – SmartLearn">
            <div className="flex flex-col gap-24">
                {/* Hero */}
                <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
                        <div className="mb-8 text-9xl font-bold text-[#f53003] dark:text-[#FF4433]">404</div>
                        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            Page Not Found
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                        </p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Link href={route('home')}>
                                <Button className="bg-[#f53003] hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]">
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </Link>
                            <Link href={route('courses.index')}>
                                <Button variant="outline">
                                    <Search className="mr-2 h-4 w-4" />
                                    Browse Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Help Section */}
                <section className="mx-auto w-full max-w-4xl px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Need Help?</h2>
                        <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                            Here are some helpful resources to get you back on track.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Popular Courses',
                                desc: 'Explore our most popular courses and start learning today.',
                                icon: Search,
                                href: route('courses.index'),
                                color: 'text-blue-500'
                            },
                            {
                                title: 'Help Center',
                                desc: 'Find answers to common questions and get support.',
                                icon: HelpCircle,
                                href: '#',
                                color: 'text-green-500'
                            },
                            {
                                title: 'Contact Support',
                                desc: 'Get in touch with our support team for assistance.',
                                icon: HelpCircle,
                                href: route('contact'),
                                color: 'text-purple-500'
                            },
                        ].map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                            >
                                <div className={`mb-4 inline-flex rounded-lg bg-[#FFEFEA] p-3 ${item.color} dark:bg-[#2A1A17]`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{item.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="relative isolate overflow-hidden bg-[#1b1b18] py-24 text-white dark:bg-[#161615]">
                    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Ready to Start Learning?</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            Don't let this 404 stop your learning journey. Explore our courses and discover new skills.
                        </p>
                        <Link
                            href={route('register')}
                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-[#1b1b18] shadow-lg hover:bg-[#f7f7f6] transition-all hover:shadow-xl"
                        >
                            Get Started Today
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
