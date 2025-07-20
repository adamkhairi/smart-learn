import { Award, BookOpen, Globe, Shield, Users, Zap } from 'lucide-react';
import { ReactNode } from 'react';

interface Feature {
    icon: ReactNode;
    title: string;
    description: string;
    color?: string;
}

interface FeaturesProps {
    title?: string;
    subtitle?: string;
    features?: Feature[];
}

const defaultFeatures: Feature[] = [
    {
        icon: <BookOpen className="h-6 w-6" />,
        title: 'Interactive Lessons',
        description: 'Videos, quizzes and projects keep you engaged and help knowledge stick.',
        color: 'text-blue-500',
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: 'Personalized Paths',
        description: 'Adaptive recommendations guide you from fundamentals to mastery.',
        color: 'text-orange-500',
    },
    {
        icon: <Award className="h-6 w-6" />,
        title: 'Progress Analytics',
        description: 'Real-time dashboards keep you and your instructors on top of your growth.',
        color: 'text-green-500',
    },
    {
        icon: <Users className="h-6 w-6" />,
        title: 'Community Support',
        description: 'Discussion boards, peer reviews and messaging keep you connected.',
        color: 'text-purple-500',
    },
    {
        icon: <Globe className="h-6 w-6" />,
        title: 'Mobile Learning',
        description: 'Access all your courses on any device – learn whenever inspiration strikes.',
        color: 'text-indigo-500',
    },
    {
        icon: <Shield className="h-6 w-6" />,
        title: 'Certificates',
        description: 'Earn shareable certificates to showcase your achievements.',
        color: 'text-red-500',
    },
];

export default function Features({
    title = 'Why SmartLearn?',
    subtitle = 'Everything you need to build knowledge, track progress and stay motivated in your learning journey.',
    features = defaultFeatures,
}: FeaturesProps) {
    return (
        <section id="features" className="mx-auto w-full max-w-7xl px-4 md:px-8">
            {/* Section Header */}
            <div className="mb-16 text-center">
                <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
                <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">{subtitle}</p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:border-[#f53003]/20 hover:shadow-lg dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                    >
                        {/* Icon */}
                        <div className={`mb-4 inline-flex rounded-lg bg-[#FFEFEA] p-3 ${feature.color} dark:bg-[#2A1A17]`}>{feature.icon}</div>

                        {/* Content */}
                        <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
