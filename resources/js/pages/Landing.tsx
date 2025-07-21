import CallToAction from '@/components/landing/CallToAction';
import FAQ from '@/components/landing/FAQ';
import Features from '@/components/landing/Features';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Testimonials from '@/components/landing/Testimonials';
import { Head } from '@inertiajs/react';

export default function Landing() {
    return (
        <>
            <Head title="SmartLearn – Learn Smarter" />
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className="mt-20 flex flex-col gap-24 bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* Hero Section */}
                <Hero />

                {/* Features Section */}
                <Features />

                {/* Testimonials Section */}
                <Testimonials />

                {/* FAQ Section */}
                <FAQ />

                {/* Call to Action Section */}
                <CallToAction />
            </main>

            {/* Footer */}
            <Footer />
        </>
    );
}
