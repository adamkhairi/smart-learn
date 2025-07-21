import PublicLayout from '@/layouts/public-layout';
import { ArrowRight, Users, Target, Heart, Award, Globe, Zap, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function About() {
    const breadcrumbs = [
        { title: 'Home', href: '/' },
        { title: 'About', href: '/about' },
    ];
    return (
        <PublicLayout title="About Us – SmartLearn" breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-24">
                {/* Hero */}
                <section className="relative isolate flex items-center overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    {/* Decorative gradient blob */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 md:px-8 lg:grid-cols-2">
                        {/* Copy */}
                        <div className="text-center lg:text-left">
                            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-2 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                                About SmartLearn
                            </span>
                            <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                                Empowering Learners
                                <span className="block bg-gradient-to-r from-[#f53003] to-[#FF9C33] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF9C33]">
                                    Worldwide
                                </span>
                            </h1>
                            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                We believe education should be accessible, engaging, and personalized. Our mission is to transform how people learn and grow in the digital age.
                            </p>
                        </div>

                        {/* Illustration */}
                        <div className="relative">
                            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#f53003]/10 to-[#FF9C33]/10 p-8">
                                <div className="flex h-full items-center justify-center">
                                    <BookOpen className="h-24 w-24 text-[#f53003] dark:text-[#FF4433]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="mx-auto w-full max-w-7xl px-4 md:px-8">
                    <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Our Mission</h2>
                            <p className="mb-6 text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                SmartLearn was founded with a simple yet powerful vision: to make quality education accessible to everyone, everywhere. We believe that learning should be a lifelong journey that adapts to individual needs and aspirations.
                            </p>
                            <p className="mb-8 text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                Through innovative technology and personalized learning experiences, we're helping millions of learners achieve their goals, advance their careers, and unlock their full potential.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                                    <span className="text-sm font-medium">Personalized Learning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                                    <span className="text-sm font-medium">Global Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                                    <span className="text-sm font-medium">Community First</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#f53003]/10 to-[#FF9C33]/10 p-8">
                                <div className="flex h-full items-center justify-center">
                                    <BookOpen className="h-24 w-24 text-[#f53003] dark:text-[#FF4433]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-[#FFF5F2] py-24 dark:bg-[#141413]">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Our Impact</h2>
                            <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                                Numbers that tell our story of growth and impact in the education space.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { number: '50K+', label: 'Active Learners', icon: Users },
                                { number: '500+', label: 'Courses Available', icon: BookOpen },
                                { number: '95%', label: 'Completion Rate', icon: Award },
                                { number: '150+', label: 'Countries Reached', icon: Globe },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="mb-4 flex justify-center">
                                        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-[#161615]">
                                            <stat.icon className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-[#f53003] dark:text-[#FF4433]">{stat.number}</div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="mx-auto w-full max-w-7xl px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Our Values</h2>
                        <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                            The principles that guide everything we do at SmartLearn.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: 'Accessibility',
                                desc: 'We believe education should be available to everyone, regardless of background or location.',
                                icon: Globe,
                                color: 'text-blue-500'
                            },
                            {
                                title: 'Innovation',
                                desc: 'We continuously push the boundaries of what\'s possible in online learning.',
                                icon: Zap,
                                color: 'text-orange-500'
                            },
                            {
                                title: 'Community',
                                desc: 'Learning is better together. We foster connections and collaboration.',
                                icon: Users,
                                color: 'text-purple-500'
                            },
                            {
                                title: 'Excellence',
                                desc: 'We maintain the highest standards in our content and platform quality.',
                                icon: Award,
                                color: 'text-green-500'
                            },
                            {
                                title: 'Empathy',
                                desc: 'We understand the challenges learners face and design solutions accordingly.',
                                icon: Heart,
                                color: 'text-red-500'
                            },
                            {
                                title: 'Growth',
                                desc: 'We\'re committed to continuous improvement and learning ourselves.',
                                icon: BookOpen,
                                color: 'text-indigo-500'
                            },
                        ].map((value) => (
                            <div
                                key={value.title}
                                className="group rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                            >
                                <div className={`mb-4 inline-flex rounded-lg bg-[#FFEFEA] p-3 ${value.color} dark:bg-[#2A1A17]`}>
                                    <value.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">{value.title}</h3>
                                <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Team */}
                <section className="bg-[#FFF5F2] py-24 dark:bg-[#141413]">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Meet Our Team</h2>
                            <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                                The passionate individuals behind SmartLearn\'s mission to transform education.
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Dr. Sarah Chen',
                                    role: 'CEO & Co-Founder',
                                    avatar: 'SC',
                                    bio: 'Former education researcher with 15+ years in edtech. Passionate about making learning accessible to all.',
                                },
                                {
                                    name: 'Marcus Rodriguez',
                                    role: 'CTO & Co-Founder',
                                    avatar: 'MR',
                                    bio: 'Tech veteran with expertise in AI and machine learning. Leads our platform development.',
                                },
                                {
                                    name: 'Dr. Emily Watson',
                                    role: 'Head of Learning',
                                    avatar: 'EW',
                                    bio: 'Educational psychologist focused on creating engaging, effective learning experiences.',
                                },
                                {
                                    name: 'Alex Kim',
                                    role: 'Head of Product',
                                    avatar: 'AK',
                                    bio: 'Product strategist with deep understanding of user needs and learning outcomes.',
                                },
                                {
                                    name: 'Priya Patel',
                                    role: 'Head of Community',
                                    avatar: 'PP',
                                    bio: 'Community builder dedicated to fostering meaningful connections between learners.',
                                },
                                {
                                    name: 'David Thompson',
                                    role: 'Head of Content',
                                    avatar: 'DT',
                                    bio: 'Curriculum expert ensuring our courses meet the highest educational standards.',
                                },
                            ].map((member) => (
                                <div key={member.name} className="rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f53003] text-lg font-medium text-white dark:bg-[#FF4433]">
                                        {member.avatar}
                                    </div>
                                    <h3 className="mb-1 text-lg font-medium">{member.name}</h3>
                                    <p className="mb-3 text-sm text-[#f53003] dark:text-[#FF4433]">{member.role}</p>
                                    <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{member.bio}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative isolate overflow-hidden bg-[#1b1b18] py-24 text-white dark:bg-[#161615]">
                    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Join Our Mission</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            Ready to be part of the future of education? Start your learning journey with SmartLearn today.
                        </p>
                        <Link
                            href={route('register')}
                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-[#1b1b18] shadow-lg hover:bg-[#f7f7f6] transition-all hover:shadow-xl"
                        >
                            Get Started Today
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
