import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
    className?: string;
    variant?: 'dark' | 'light' | 'gradient';
}

export default function CallToAction({
    title = "Ready to start your journey?",
    subtitle = "Join thousands of learners accelerating their careers with SmartLearn.",
    buttonText = "Create your free account",
    buttonHref = "/register",
    className = "",
    variant = 'dark'
}: CTAProps) {
    const getVariantClasses = () => {
        switch (variant) {
            case 'light':
                return 'bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#161615] dark:text-[#EDEDEC]';
            case 'gradient':
                return 'bg-gradient-to-r from-[#f53003] to-[#FF9C33] text-white';
            case 'dark':
            default:
                return 'bg-[#1b1b18] text-white dark:bg-[#161615]';
        }
    };

    const getButtonClasses = () => {
        switch (variant) {
            case 'light':
                return 'bg-[#f53003] text-white hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]';
            case 'gradient':
                return 'bg-white text-[#1b1b18] hover:bg-[#f7f7f6] shadow-lg hover:shadow-xl';
            case 'dark':
            default:
                return 'bg-white text-[#1b1b18] hover:bg-[#f7f7f6] shadow-lg hover:shadow-xl';
        }
    };

    const getSubtitleClasses = () => {
        switch (variant) {
            case 'light':
                return 'text-[#706f6c] dark:text-[#A1A09A]';
            case 'gradient':
                return 'text-white/90';
            case 'dark':
            default:
                return 'text-[#d4d4d4]';
        }
    };

    return (
        <section className={`relative isolate overflow-hidden py-24 ${getVariantClasses()} ${className}`}>
            <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                {/* Title */}
                <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">
                    {title}
                </h2>

                {/* Subtitle */}
                <p className={`mb-10 max-w-xl text-lg leading-relaxed ${getSubtitleClasses()}`}>
                    {subtitle}
                </p>

                {/* CTA Button */}
                <Link
                    href={buttonHref}
                    className={`group inline-flex items-center gap-2 rounded-lg px-8 py-3 font-medium transition-all ${getButtonClasses()}`}
                >
                    {buttonText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Background pattern - only for dark variant */}
            {variant === 'dark' && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/img/noise.svg')] opacity-5" />
            )}

            {/* Background gradient blobs for gradient variant */}
            {variant === 'gradient' && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 left-1/2 aspect-[4/3] w-[40rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute top-20 right-1/4 aspect-[4/3] w-[30rem] rounded-full bg-white/5 blur-3xl" />
                </div>
            )}
        </section>
    );
}
