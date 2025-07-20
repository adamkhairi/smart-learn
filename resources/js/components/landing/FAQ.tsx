import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQProps {
    title?: string;
    subtitle?: string;
    contactEmail?: string;
    items?: FAQItem[];
}

const defaultFAQItems: FAQItem[] = [
    {
        question: 'Is SmartLearn really free?',
        answer: 'Yes! Our Starter plan is 100% free forever. You can learn at your own pace with no credit-card required.',
    },
    {
        question: 'Can I cancel my subscription at any time?',
        answer: 'Absolutely. Upgrade, downgrade or cancel directly from your dashboard — no hidden fees, no questions asked.',
    },
    {
        question: 'Do you offer team licenses?',
        answer: 'Yes. Our Team plan is designed for classrooms and organisations. You can manage members, assign courses and track collective progress.',
    },
    {
        question: 'What types of courses do you offer?',
        answer: 'We offer courses in technology, business, design, marketing, and more. From beginner to advanced levels, there\'s something for everyone.',
    },
    {
        question: 'Can I get a certificate?',
        answer: 'Yes! Pro and Team subscribers can earn certificates upon course completion. These are shareable and recognized by employers.',
    },
];

export default function FAQ({
    title = "Frequently Asked Questions",
    subtitle,
    contactEmail = "support@smartlearn.com",
    items = defaultFAQItems
}: FAQProps) {
    const defaultSubtitle = (
        <>
            Can't find what you're looking for? Email us at{' '}
            <a
                href={`mailto:${contactEmail}`}
                className="underline hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors"
            >
                {contactEmail}
            </a>
            .
        </>
    );

    return (
        <section id="faq" className="mx-auto w-full max-w-3xl px-4 md:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">
                    {title}
                </h2>
                <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                    {subtitle || defaultSubtitle}
                </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <Collapsible
                        key={index}
                        className="rounded-lg border border-[#e3e3e0] bg-white p-4 transition-all hover:shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]"
                    >
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-left font-medium hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                            {item.question}
                            <svg
                                className="h-4 w-4 transition-transform data-[state=open]:rotate-180"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.174l3.71-3.944a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            {item.answer}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </section>
    );
}
