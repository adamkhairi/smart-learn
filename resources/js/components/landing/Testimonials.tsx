import { Star } from 'lucide-react';

interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    avatar?: string;
}

interface TestimonialsProps {
    title?: string;
    subtitle?: string;
    testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
    {
        name: 'Sarah Johnson',
        role: 'Software Developer',
        content: 'SmartLearn helped me transition from marketing to software development. The personalized learning paths made all the difference.',
        rating: 5
    },
    {
        name: 'Michael Chen',
        role: 'Data Scientist',
        content: 'The interactive lessons and real-time feedback kept me motivated throughout my learning journey. Highly recommended!',
        rating: 5
    },
    {
        name: 'Emily Rodriguez',
        role: 'UX Designer',
        content: 'The community support and peer reviews helped me build a strong portfolio. SmartLearn is more than just courses.',
        rating: 5
    }
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function Testimonials({
    title = "What Our Learners Say",
    subtitle = "Join thousands of satisfied learners who have transformed their careers with SmartLearn.",
    testimonials = defaultTestimonials
}: TestimonialsProps) {
    return (
        <section id="testimonials" className="bg-[#FFF5F2] py-24 dark:bg-[#141413]">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">
                        {title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                        {subtitle}
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-[#f53003]/20 dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                        >
                            {/* Rating Stars */}
                            <div className="mb-4 flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < testimonial.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Testimonial Content */}
                            <blockquote className="mb-4 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                "{testimonial.content}"
                            </blockquote>

                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f53003] text-sm font-medium text-white dark:bg-[#FF4433]">
                                    {testimonial.avatar || getInitials(testimonial.name)}
                                </div>

                                {/* Name and Role */}
                                <div>
                                    <div className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
