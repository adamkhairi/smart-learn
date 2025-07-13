import PublicLayout from '@/layouts/public-layout';
import { ArrowRight, Shield, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <PublicLayout title="Privacy Policy – SmartLearn">
            <div className="flex flex-col gap-24">
                {/* Hero */}
                <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-2 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                            <Shield className="h-4 w-4" />
                            Privacy & Security
                        </span>
                        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            Privacy Policy
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="mx-auto w-full max-w-4xl px-4 md:px-8">
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <div className="space-y-12">
                            {/* Introduction */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    SmartLearn ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our learning platform and services.
                                </p>
                                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                    By using SmartLearn, you agree to the collection and use of information in accordance with this policy.
                                </p>
                            </div>

                            {/* Information We Collect */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

                                <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We may collect personal information that you provide directly to us, including:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Name and contact information (email address, phone number)</li>
                                    <li>Account credentials and profile information</li>
                                    <li>Payment and billing information</li>
                                    <li>Course preferences and learning history</li>
                                    <li>Communications with our support team</li>
                                </ul>

                                <h3 className="text-xl font-medium mb-3">Usage Information</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We automatically collect certain information about your use of our platform:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Device information and IP address</li>
                                    <li>Browser type and operating system</li>
                                    <li>Pages visited and time spent on our platform</li>
                                    <li>Course progress and completion data</li>
                                    <li>Interaction with course content and assessments</li>
                                </ul>
                            </div>

                            {/* How We Use Information */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We use the information we collect to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Provide and maintain our learning platform</li>
                                    <li>Process payments and manage subscriptions</li>
                                    <li>Personalize your learning experience</li>
                                    <li>Track your progress and provide feedback</li>
                                    <li>Send important updates and notifications</li>
                                    <li>Improve our services and develop new features</li>
                                    <li>Ensure platform security and prevent fraud</li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </div>

                            {/* Information Sharing */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Information Sharing and Disclosure</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                                    <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
                                    <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                                </ul>
                            </div>

                            {/* Data Security */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We implement appropriate technical and organizational measures to protect your personal information:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Encryption of data in transit and at rest</li>
                                    <li>Regular security assessments and updates</li>
                                    <li>Access controls and authentication measures</li>
                                    <li>Secure data centers and infrastructure</li>
                                    <li>Employee training on data protection</li>
                                </ul>
                            </div>

                            {/* Your Rights */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    You have certain rights regarding your personal information:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li><strong>Access:</strong> Request access to your personal information</li>
                                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                                    <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                                    <li><strong>Object:</strong> Object to certain processing of your information</li>
                                </ul>
                            </div>

                            {/* Cookies */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We use cookies and similar technologies to enhance your experience:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                                    <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                    <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
                                </ul>
                                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                    You can control cookie settings through your browser preferences.
                                </p>
                            </div>

                            {/* Children's Privacy */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                                </p>
                            </div>

                            {/* International Transfers */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                                </p>
                            </div>

                            {/* Changes to Policy */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                                </p>
                                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                    We encourage you to review this Privacy Policy periodically for any changes.
                                </p>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="bg-[#FFF5F2] dark:bg-[#141413] p-6 rounded-lg">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] mb-2">
                                        <strong>Email:</strong> privacy@smartlearn.com
                                    </p>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] mb-2">
                                        <strong>Address:</strong> 123 Learning Street, San Francisco, CA 94105
                                    </p>
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                        <strong>Phone:</strong> +1 (555) 012-3456
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="relative isolate overflow-hidden bg-[#1b1b18] py-24 text-white dark:bg-[#161615]">
                    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center md:px-8">
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Questions About Privacy?</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            We're here to help. Contact our privacy team for any questions about your data.
                        </p>
                        <Link
                            href="#"
                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-[#1b1b18] shadow-lg hover:bg-[#f7f7f6] transition-all hover:shadow-xl"
                        >
                            Contact Privacy Team
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
