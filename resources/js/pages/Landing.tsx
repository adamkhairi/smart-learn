import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import SmoothAnchor from '@/components/smooth-anchor';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, Users, Award, CheckCircle, Star, Play, Zap, Shield, Globe, Heart } from 'lucide-react';

export default function Landing() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="SmartLearn – Learn Smarter" />

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
                        <SmoothAnchor href="#features" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Features
                        </SmoothAnchor>
                        <SmoothAnchor href="#testimonials" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Testimonials
                        </SmoothAnchor>
                        <SmoothAnchor href="#pricing" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            Pricing
                        </SmoothAnchor>
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
            <main className="mt-20 flex flex-col gap-24 bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Hero */}
                <section className="relative isolate flex items-center overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    {/* Decorative gradient blob */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                        <div className="absolute top-20 right-1/4 aspect-[4/3] w-[40rem] rounded-full bg-[#FF9C33]/10 blur-3xl dark:bg-[#FF9C33]/10" />
                    </div>

                    <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 md:px-8 lg:grid-cols-2">
                        {/* Copy */}
                        <div className="text-center lg:text-left">
                            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-2 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                                🚀 Launch your learning journey
                            </span>
                            <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                                Learn&nbsp;
                                <span className="bg-gradient-to-r from-[#f53003] to-[#FF9C33] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF9C33]">
                                    Smarter
                                </span>
                                , Grow Faster
                            </h1>
                            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#706f6c] lg:max-w-none dark:text-[#A1A09A]">
                                Unlock interactive courses, personalized paths, and insightful analytics—all in one powerful platform designed for modern learners.
                            </p>

                            {/* Stats */}
                            <div className="mb-8 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#f53003] dark:text-[#FF4433]">50K+</div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Active Learners</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#f53003] dark:text-[#FF4433]">500+</div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Courses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#f53003] dark:text-[#FF4433]">95%</div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Completion Rate</div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                                <Link
                                    href={route('register')}
                                    className="group inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-8 py-3 font-medium text-white shadow-lg hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29] transition-all hover:shadow-xl"
                                >
                                    Start Learning – Free
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href={route('courses.index')}
                                    className="group inline-flex items-center gap-2 rounded-lg border border-[#1b1b18] px-8 py-3 font-medium text-[#1b1b18] hover:bg-[#1b1b18] hover:text-white dark:border-[#EDEDEC] dark:text-[#EDEDEC] dark:hover:bg-[#EDEDEC] dark:hover:text-[#1b1b18] transition-all"
                                >
                                    <Play className="h-4 w-4" />
                                    Explore Courses
                                </Link>
                            </div>
                        </div>

                        {/* Illustration */}
                        <div className="relative hidden lg:block">
                            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#e3e3e0] shadow-2xl dark:border-[#3E3E3A]">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#f53003]/10 to-[#FF9C33]/10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="mx-auto w-full max-w-7xl px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Why SmartLearn?</h2>
                        <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                            Everything you need to build knowledge, track progress and stay motivated in your learning journey.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <BookOpen className="h-6 w-6" />,
                                title: 'Interactive Lessons',
                                desc: 'Videos, quizzes and projects keep you engaged and help knowledge stick.',
                                color: 'text-blue-500'
                            },
                            {
                                icon: <Zap className="h-6 w-6" />,
                                title: 'Personalized Paths',
                                desc: 'Adaptive recommendations guide you from fundamentals to mastery.',
                                color: 'text-orange-500'
                            },
                            {
                                icon: <Award className="h-6 w-6" />,
                                title: 'Progress Analytics',
                                desc: 'Real-time dashboards keep you and your instructors on top of your growth.',
                                color: 'text-green-500'
                            },
                            {
                                icon: <Users className="h-6 w-6" />,
                                title: 'Community Support',
                                desc: 'Discussion boards, peer reviews and messaging keep you connected.',
                                color: 'text-purple-500'
                            },
                            {
                                icon: <Globe className="h-6 w-6" />,
                                title: 'Mobile Learning',
                                desc: 'Access all your courses on any device – learn whenever inspiration strikes.',
                                color: 'text-indigo-500'
                            },
                            {
                                icon: <Shield className="h-6 w-6" />,
                                title: 'Certificates',
                                desc: 'Earn shareable certificates to showcase your achievements.',
                                color: 'text-red-500'
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="group rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                            >
                                <div className={`mb-4 inline-flex rounded-lg bg-[#FFEFEA] p-3 ${f.color} dark:bg-[#2A1A17]`}>
                                    {f.icon}
                                </div>
                                <h3 className="mb-2 text-lg font-medium">{f.title}</h3>
                                <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Testimonials */}
                <section id="testimonials" className="bg-[#FFF5F2] py-24 dark:bg-[#141413]">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">What Our Learners Say</h2>
                            <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                                Join thousands of satisfied learners who have transformed their careers with SmartLearn.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Sarah Johnson',
                                    role: 'Software Developer',
                                    avatar: 'SJ',
                                    content: 'SmartLearn helped me transition from marketing to software development. The personalized learning paths made all the difference.',
                                    rating: 5
                                },
                                {
                                    name: 'Michael Chen',
                                    role: 'Data Scientist',
                                    avatar: 'MC',
                                    content: 'The interactive lessons and real-time feedback kept me motivated throughout my learning journey. Highly recommended!',
                                    rating: 5
                                },
                                {
                                    name: 'Emily Rodriguez',
                                    role: 'UX Designer',
                                    avatar: 'ER',
                                    content: 'The community support and peer reviews helped me build a strong portfolio. SmartLearn is more than just courses.',
                                    rating: 5
                                }
                            ].map((testimonial) => (
                                <div key={testimonial.name} className="rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="mb-4 flex items-center gap-2">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f53003] text-sm font-medium text-white dark:bg-[#FF4433]">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-medium">{testimonial.name}</div>
                                            <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="py-24">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Simple Pricing</h2>
                            <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                                Start free. Upgrade whenever you need more power.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Starter',
                                    price: '$0',
                                    desc: 'Get access to all free courses and community forums.',
                                    features: ['Unlimited free courses', 'Community support', 'Basic progress tracking', 'Mobile access'],
                                    highlight: false,
                                },
                                {
                                    name: 'Pro',
                                    price: '$19/mo',
                                    desc: 'Unlock advanced courses and personalized analytics.',
                                    features: ['Everything in Starter', 'Premium courses', 'Detailed analytics', 'Certificates', 'Priority support'],
                                    highlight: true,
                                },
                                {
                                    name: 'Team',
                                    price: '$49/mo',
                                    desc: 'Collaborative learning for teams and classrooms.',
                                    features: ['Everything in Pro', 'Team analytics', 'Group projects', 'Dedicated support', 'Custom branding'],
                                    highlight: false,
                                },
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] ${
                                        plan.highlight ? 'border-[#f53003] ring-2 ring-[#f53003]/40 dark:border-[#FF4433] scale-105' : 'border-[#e3e3e0]'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <span className="absolute top-4 right-4 rounded-full bg-[#f53003] px-3 py-1 text-xs font-medium text-white dark:bg-[#FF4433]">
                                            Popular
                                        </span>
                                    )}
                                    <h3 className="mb-4 text-xl font-semibold">{plan.name}</h3>
                                    <p className="mb-6 text-3xl font-bold">{plan.price}</p>
                                    <p className="mb-6 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{plan.desc}</p>
                                    <ul className="mb-8 flex flex-col gap-3 text-sm">
                                        {plan.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-[#f53003] dark:text-[#FF4433]" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className={`mt-auto inline-block rounded-lg px-6 py-3 text-center text-sm font-medium text-white shadow transition-all hover:shadow-lg ${
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
                    <div className="text-center mb-12">
                        <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Frequently Asked Questions</h2>
                        <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                            Can't find what you're looking for? Email us at{' '}
                            <a href="mailto:support@smartlearn.com" className="underline hover:text-[#f53003] dark:hover:text-[#FF4433]">
                                support@smartlearn.com
                            </a>
                            .
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is SmartLearn really free?',
                                a: 'Yes! Our Starter plan is 100% free forever. You can learn at your own pace with no credit-card required.',
                            },
                            {
                                q: 'Can I cancel my subscription at any time?',
                                a: 'Absolutely. Upgrade, downgrade or cancel directly from your dashboard — no hidden fees, no questions asked.',
                            },
                            {
                                q: 'Do you offer team licenses?',
                                a: 'Yes. Our Team plan is designed for classrooms and organisations. You can manage members, assign courses and track collective progress.',
                            },
                            {
                                q: 'What types of courses do you offer?',
                                a: 'We offer courses in technology, business, design, marketing, and more. From beginner to advanced levels, there\'s something for everyone.',
                            },
                            {
                                q: 'Can I get a certificate?',
                                a: 'Yes! Pro and Team subscribers can earn certificates upon course completion. These are shareable and recognized by employers.',
                            },
                        ].map((item, idx) => (
                            <Collapsible
                                key={idx}
                                className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]"
                            >
                                <CollapsibleTrigger className="flex w-full items-center justify-between text-left font-medium hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                    {item.q}
                                    <svg
                                        className="h-4 w-4 transition-transform data-[state=open]:rotate-180"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.174l3.71-3.944a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
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
                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-[#1b1b18] shadow-lg hover:bg-[#f7f7f6] transition-all hover:shadow-xl"
                        >
                            Create your free account
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    {/* Background pattern */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/img/noise.svg')] opacity-5" />
                </section>
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
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                    <Heart className="h-5 w-5" />
                                </a>
                            </div>
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
                                <Link href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                    Privacy
                                </Link>
                                <Link href="#" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
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
