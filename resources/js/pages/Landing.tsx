import { Head, Link, usePage } from '@inertiajs/react';;
import { type SharedData } from '@/types';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLogo from '@/components/app-logo';

export default function Landing() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="SmartLearn – Learn Smarter" />

            {/* Header */}
            <header className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur dark:bg-[#0a0a0acc]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link href={route('home')} className="flex items-center gap-2 text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            <AppLogo />
                        </Link>
                    </div>
                    <nav className="hidden items-center gap-8 text-sm lg:flex">
                        <Link href={route('courses.index')} className="hover:text-[#f53003] dark:hover:text-[#FF4433]">
                            Courses
                        </Link>
                        <Link href="#features" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">
                            Features
                        </Link>
                        <Link href="#pricing" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">
                            Pricing
                        </Link>
                        <Link href="#faq" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">
                            FAQ
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4 text-sm">
                        <AppearanceToggleDropdown />
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded border border-[#19140035] px-4 py-1.5 font-medium text-[#1b1b18] hover:border-[#19140080] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-1.5 font-medium text-[#1b1b18] hover:text-[#f53003] dark:text-[#EDEDEC] dark:hover:text-[#FF4433]"
                                >
                                    Log&nbsp;in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded bg-[#f53003] px-4 py-1.5 font-medium text-white shadow hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]"
                                >
                                    Get&nbsp;Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="mt-20 flex flex-col gap-24 bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Hero */}
                <section className="relative isolate flex items-center overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent dark:from-[#1a0a0a] pt-28 pb-32">
                    {/* Decorative gradient blob */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 md:px-8 lg:grid-cols-2">
                        {/* Copy */}
                        <div className="text-center lg:text-left">
                            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-1 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                                🚀 Launch your learning journey
                            </span>
                            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                                Learn&nbsp;
                                <span className="bg-gradient-to-r from-[#f53003] to-[#FF9C33] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF9C33]">
                                    Smarter
                                </span>
                                , Grow Faster
                            </h1>
                            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A] lg:max-w-none">
                                Unlock interactive courses, personalised paths and insightful analytics—all in one powerful platform.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded bg-[#f53003] px-8 py-3 font-medium text-white shadow hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]"
                                >
                                    Start Learning – Free
                                </Link>
                                <Link
                                    href={route('courses.index')}
                                    className="inline-block rounded border border-[#1b1b18] px-8 py-3 font-medium text-[#1b1b18] hover:bg-[#1b1b18] hover:text-white dark:border-[#EDEDEC] dark:text-[#EDEDEC] dark:hover:bg-[#EDEDEC] dark:hover:text-[#1b1b18]"
                                >
                                    Explore Courses
                                </Link>
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="relative hidden lg:block">
                            <div className="relative aspect-video overflow-hidden rounded-lg border border-[#e3e3e0] shadow-sm dark:border-[#3E3E3A]">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto w-full max-w-7xl px-4 md:px-8">
                    <h2 className="mb-3 text-center text-3xl font-semibold sm:text-4xl">Why SmartLearn?</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-[#706f6c] dark:text-[#A1A09A]">
                        Everything you need to build knowledge, track progress and stay motivated.
                    </p>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Interactive Lessons',
                                desc: 'Videos, quizzes and projects keep you engaged and help knowledge stick.'
                            },
                            {
                                title: 'Personalised Paths',
                                desc: 'Adaptive recommendations guide you from fundamentals to mastery.'
                            },
                            {
                                title: 'Progress Analytics',
                                desc: 'Real-time dashboards keep you and your instructors on top of your growth.'
                            },
                            {
                                title: 'Community Support',
                                desc: 'Discussion boards, peer reviews and messaging keep you connected.'
                            },
                            {
                                title: 'Mobile Learning',
                                desc: 'Access all your courses on any device – learn whenever inspiration strikes.'
                            },
                            {
                                title: 'Certificates',
                                desc: 'Earn shareable certificates to showcase your achievements.'
                            }
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="rounded-lg border border-[#e3e3e0] bg-white p-6 shadow-sm transition hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <h3 className="mb-2 text-lg font-medium">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="bg-[#FFF5F2] dark:bg-[#141413] py-24">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                        <h2 className="mb-3 text-center text-3xl font-semibold sm:text-4xl">Simple Pricing</h2>
                        <p className="mx-auto mb-12 max-w-2xl text-center text-[#706f6c] dark:text-[#A1A09A]">
                            Start free. Upgrade whenever you need more power.
                        </p>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Starter',
                                    price: '$0',
                                    desc: 'Get access to all free courses and community forums.',
                                    features: ['Unlimited free courses', 'Community support', 'Basic progress tracking'],
                                    highlight: false
                                },
                                {
                                    name: 'Pro',
                                    price: '$19/mo',
                                    desc: 'Unlock advanced courses and personalised analytics.',
                                    features: ['Everything in Starter', 'Premium courses', 'Detailed analytics', 'Certificates'],
                                    highlight: true
                                },
                                {
                                    name: 'Team',
                                    price: '$49/mo',
                                    desc: 'Collaborative learning for teams and classrooms.',
                                    features: ['Everything in Pro', 'Team analytics', 'Group projects', 'Dedicated support'],
                                    highlight: false
                                }
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col overflow-hidden rounded-lg border p-6 shadow-sm transition hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615] ${
                                        plan.highlight ? 'border-[#f53003] ring-2 ring-[#f53003]/40 dark:border-[#FF4433]' : 'border-[#e3e3e0]'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <span className="absolute right-4 top-4 rounded-full bg-[#f53003] px-3 py-0.5 text-xs font-medium leading-relaxed text-white dark:bg-[#FF4433]">
                                            Popular
                                        </span>
                                    )}
                                    <h3 className="mb-4 text-xl font-semibold">{plan.name}</h3>
                                    <p className="mb-6 text-3xl font-bold">{plan.price}</p>
                                    <p className="mb-6 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{plan.desc}</p>
                                    <ul className="mb-8 flex flex-col gap-2 text-sm">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2">
                                                <svg className="h-4 w-4 text-[#f53003] dark:text-[#FF4433]" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M6.003 11.803l-3.75-3.75 1.414-1.414 2.336 2.335 5.336-5.336 1.414 1.414-6.75 6.75z" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className={`mt-auto inline-block rounded px-6 py-2 text-center text-sm font-medium text-white shadow transition-colors ${
                                            plan.highlight
                                                ? 'bg-[#f53003] hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]'
                                                : 'bg-[#1b1b18] hover:bg-black dark:bg-[#EDEDEC] dark:text-[#1b1b18]'
                                        }`}
                                    >
                                        {plan.highlight ? 'Get Pro' : 'Get Started'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="mx-auto w-full max-w-3xl px-4 md:px-8">
                    <h2 className="mb-3 text-center text-3xl font-semibold sm:text-4xl">Frequently Asked Questions</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-center text-[#706f6c] dark:text-[#A1A09A]">
                        Can't find what you're looking for? Email us at <a href="mailto:support@smartlearn.com" className="underline">support@smartlearn.com</a>.
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is SmartLearn really free?',
                                a: 'Yes! Our Starter plan is 100% free forever. You can learn at your own pace with no credit-card required.'
                            },
                            {
                                q: 'Can I cancel my subscription at any time?',
                                a: 'Absolutely. Upgrade, downgrade or cancel directly from your dashboard — no hidden fees, no questions asked.'
                            },
                            {
                                q: 'Do you offer team licenses?',
                                a: 'Yes. Our Team plan is designed for classrooms and organisations. You can manage members, assign courses and track collective progress.'
                            }
                        ].map((item, idx) => (
                            <Collapsible key={idx} className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <CollapsibleTrigger className="flex w-full items-center justify-between text-left font-medium">
                                    {item.q}
                                    <svg className="h-4 w-4 transition-transform data-[state=open]:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.174l3.71-3.944a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                    {item.a}
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </section>

                {/* CTA section */}
                <section className="relative isolate overflow-hidden bg-[#1b1b18] py-24 text-white dark:bg-[#161615]">
                    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Ready to start your journey?</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            Join thousands of learners accelerating their careers with SmartLearn.
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block rounded bg-white px-8 py-3 font-medium text-[#1b1b18] shadow hover:bg-[#f7f7f6]"
                        >
                            Create your free account
                        </Link>
                    </div>
                    {/* Background pattern */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/img/noise.svg')] opacity-5"
                    />
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#FDFDFC] py-10 text-sm text-[#706f6c] dark:bg-[#0a0a0a] dark:text-[#A1A09A]">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between md:px-8">
                    <p>&copy; {new Date().getFullYear()} SmartLearn. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">Privacy</Link>
                        <Link href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433]">Terms</Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
