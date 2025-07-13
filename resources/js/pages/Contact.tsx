import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Contact() {
    return (
        <PublicLayout title="Contact Us – SmartLearn">
            <div className="flex flex-col gap-24">
                {/* Hero */}
                <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-2 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                            Get in Touch
                        </span>
                        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            We'd Love to
                            <span className="block bg-gradient-to-r from-[#f53003] to-[#FF9C33] bg-clip-text text-transparent dark:from-[#FF4433] dark:to-[#FF9C33]">
                                Hear from You
                            </span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Have questions about SmartLearn? Need support? Want to collaborate? We're here to help and would love to hear from you.
                        </p>
                    </div>
                </section>

                {/* Contact Form & Info */}
                <section className="mx-auto w-full max-w-7xl px-4 md:px-8">
                    <div className="grid gap-16 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div>
                            <h2 className="mb-6 text-3xl font-semibold">Send us a Message</h2>
                            <form className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="first-name" className="mb-2 block text-sm font-medium">
                                            First Name
                                        </label>
                                        <Input
                                            id="first-name"
                                            type="text"
                                            placeholder="John"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="last-name" className="mb-2 block text-sm font-medium">
                                            Last Name
                                        </label>
                                        <Input
                                            id="last-name"
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                                        Subject
                                    </label>
                                    <Input
                                        id="subject"
                                        type="text"
                                        placeholder="How can we help?"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="mb-2 block text-sm font-medium">
                                        Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us more about your inquiry..."
                                        className="w-full min-h-[120px]"
                                    />
                                </div>
                                <Button className="w-full bg-[#f53003] hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h2 className="mb-6 text-3xl font-semibold">Get in Touch</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                        <Mail className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-medium">Email Us</h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            <a href="mailto:hello@smartlearn.com" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                                hello@smartlearn.com
                                            </a>
                                        </p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            <a href="mailto:support@smartlearn.com" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                                support@smartlearn.com
                                            </a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                        <Phone className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-medium">Call Us</h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            <a href="tel:+1-555-0123" className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors">
                                                +1 (555) 012-3456
                                            </a>
                                        </p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Monday - Friday, 9AM - 6PM EST
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                        <MapPin className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-medium">Visit Us</h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            123 Learning Street<br />
                                            San Francisco, CA 94105<br />
                                            United States
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                        <MessageSquare className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-medium">Live Chat</h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Available 24/7 for instant support
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            Start Chat
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="bg-[#FFF5F2] py-24 dark:bg-[#141413]">
                    <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
                        <div className="text-center mb-16">
                            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl">Frequently Asked Questions</h2>
                            <p className="mx-auto max-w-2xl text-[#706f6c] dark:text-[#A1A09A]">
                                Quick answers to common questions about SmartLearn.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    q: 'How do I get started with SmartLearn?',
                                    a: 'Simply create a free account and browse our course catalog. You can start learning immediately with our free courses.',
                                },
                                {
                                    q: 'What payment methods do you accept?',
                                    a: 'We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely.',
                                },
                                {
                                    q: 'Can I cancel my subscription anytime?',
                                    a: 'Yes, you can cancel your subscription at any time from your account settings. No questions asked.',
                                },
                                {
                                    q: 'Do you offer refunds?',
                                    a: 'We offer a 30-day money-back guarantee for all paid subscriptions.',
                                },
                                {
                                    q: 'How can I contact customer support?',
                                    a: 'You can reach us via email, phone, or live chat. Our support team is available 24/7.',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <h3 className="mb-2 font-medium">{item.q}</h3>
                                    <p className="text-sm leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative isolate overflow-hidden bg-[#1b1b18] py-24 text-white dark:bg-[#161615]">
                    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Ready to Start Learning?</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            Join thousands of learners who are already transforming their careers with SmartLearn.
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
