import { Link } from '@inertiajs/react';
import { ArrowRight, Play } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { useAuth } from '@/hooks/use-auth';

interface HeroStats {
    value: string;
    label: string;
}

interface HeroProps {
    stats?: HeroStats[];
    showIllustration?: boolean;
}

const defaultStats: HeroStats[] = [
    { value: '50K+', label: 'Active Learners' },
    { value: '500+', label: 'Courses' },
    { value: '95%', label: 'Completion Rate' },
];

export default function Hero({ stats = defaultStats, showIllustration = true }: HeroProps) {
    const { isAuthenticated } = useAuth();

    return (
        <section className="relative isolate flex items-center overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
            {/* Decorative gradient blobs */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                <div className="absolute top-20 right-1/4 aspect-[4/3] w-[40rem] rounded-full bg-[#FF9C33]/10 blur-3xl dark:bg-[#FF9C33]/10" />
            </div>

            <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 md:px-8 lg:grid-cols-2">
                {/* Content */}
                <div className="text-center lg:text-left">
                    {/* Main heading */}
                    <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                        {/*Learn&nbsp;*/}
                        {/*<span className="bg-gradient-to-r from-[#f53003] to-[#FF9C33] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF9C33]">*/}
                        {/*    Smarter*/}
                        {/*</span>*/}
                        Learn Smarter, Grow Faster
                    </h1>

                    {/* Subheading */}
                    <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#706f6c] lg:max-w-none dark:text-[#A1A09A]">
                        Unlock interactive courses, personalized paths, and insightful analytics—all in one powerful platform designed for modern learners.
                    </p>

                    {/* Statistics */}
                    {/*<div className="mb-8 flex flex-wrap items-center justify-center gap-8 lg:justify-start">*/}
                    {/*    {stats.map((stat, index) => (*/}
                    {/*        <div key={index} className="text-center">*/}
                    {/*            <div className="text-2xl font-bold text-[#f53003] dark:text-[#FF4433]">*/}
                    {/*                {stat.value}*/}
                    {/*            </div>*/}
                    {/*            <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">*/}
                    {/*                {stat.label}*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                        {!isAuthenticated ? (
                            <Link
                                href={route('register')}
                                className="group inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-8 py-3 font-medium text-white shadow-lg hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29] transition-all hover:shadow-xl"
                            >
                                Start Learning
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        ) : (
                            <Link
                                href={route('courses.index')}
                                className="group inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-8 py-3 font-medium text-white shadow-lg hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29] transition-all hover:shadow-xl"
                            >
                                <Play className="h-4 w-4" />
                                Explore Courses
                            </Link>
                        )}
                    </div>
                </div>

                {/* Illustration */}
                {showIllustration && (
                    <div className="relative hidden lg:block">
                        <div className=" ">
                            <img
                                src={'/hero.svg'}
                                alt="Hero Illustration"
                                className="w-5/6 mx-auto"
                            />
                            {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#f53003]/10 to-[#FF9C33]/10" /> */}

                            {/* Optional: Add floating UI elements */}
                            {/*<div className="absolute top-4 right-4 rounded-lg bg-white/80 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <div className="h-2 w-2 rounded-full bg-green-500"></div>*/}
                            {/*        <span className="text-xs font-medium">Live Course</span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/*<div className="absolute bottom-4 left-4 rounded-lg bg-white/80 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900/80">*/}
                            {/*    <div className="flex items-center gap-2">*/}
                            {/*        <div className="h-6 w-6 rounded-full bg-[#f53003] flex items-center justify-center">*/}
                            {/*            <span className="text-xs font-bold text-white">95%</span>*/}
                            {/*        </div>*/}
                            {/*        <span className="text-xs font-medium">Progress</span>*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
