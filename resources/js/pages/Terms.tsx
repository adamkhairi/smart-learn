import PublicLayout from '@/layouts/public-layout';
import { ArrowRight, FileText, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <PublicLayout title="Terms of Service – SmartLearn">
            <div className="flex flex-col gap-24">
                {/* Hero */}
                <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF5F2] via-transparent to-transparent pt-28 pb-32 dark:from-[#1a0a0a]">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-56 left-1/2 aspect-[4/3] w-[70rem] -translate-x-1/2 rounded-full bg-[#f53003]/20 blur-3xl dark:bg-[#FF4433]/20" />
                    </div>

                    <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#FFEFEA] px-4 py-2 text-xs font-medium text-[#f53003] dark:bg-[#2A1A17] dark:text-[#FF4433]">
                            <FileText className="h-4 w-4" />
                            Legal Information
                        </span>
                        <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                            Terms of Service
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                            Please read these terms carefully before using SmartLearn. By using our platform, you agree to these terms.
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
                                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    By accessing and using SmartLearn ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                                </p>
                            </div>

                            {/* Definitions */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li><strong>"Platform"</strong> refers to SmartLearn, including all websites, applications, and services</li>
                                    <li><strong>"User"</strong> refers to any individual who accesses or uses the Platform</li>
                                    <li><strong>"Content"</strong> refers to all text, graphics, images, videos, and other materials on the Platform</li>
                                    <li><strong>"Course"</strong> refers to any educational content or learning material available on the Platform</li>
                                    <li><strong>"Subscription"</strong> refers to any paid access to premium features or content</li>
                                </ul>
                            </div>

                            {/* User Accounts */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                                <h3 className="text-xl font-medium mb-3">Account Creation</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    To access certain features of the Platform, you must create an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Provide accurate, current, and complete information</li>
                                    <li>Maintain and update your account information</li>
                                    <li>Keep your account credentials secure and confidential</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                </ul>

                                <h3 className="text-xl font-medium mb-3">Account Termination</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
                                </p>
                            </div>

                            {/* Acceptable Use */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Use the Platform for any illegal or unauthorized purpose</li>
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Infringe upon the rights of others</li>
                                    <li>Upload or transmit harmful, offensive, or inappropriate content</li>
                                    <li>Attempt to gain unauthorized access to the Platform</li>
                                    <li>Interfere with or disrupt the Platform's operation</li>
                                    <li>Share account credentials with others</li>
                                    <li>Use automated systems to access the Platform</li>
                                </ul>
                            </div>

                            {/* Intellectual Property */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
                                <h3 className="text-xl font-medium mb-3">Platform Content</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    The Platform and its original content, features, and functionality are owned by SmartLearn and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                </p>

                                <h3 className="text-xl font-medium mb-3">User Content</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    You retain ownership of any content you submit to the Platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
                                </p>

                                <h3 className="text-xl font-medium mb-3">Course Content</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Course content is provided for educational purposes only. You may not copy, distribute, or create derivative works without explicit permission.
                                </p>
                            </div>

                            {/* Privacy */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Protection</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                                </p>
                            </div>

                            {/* Subscriptions and Payments */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">7. Subscriptions and Payments</h2>
                                <h3 className="text-xl font-medium mb-3">Subscription Terms</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Premium subscriptions are billed on a recurring basis. You agree to pay all fees associated with your subscription.
                                </p>

                                <h3 className="text-xl font-medium mb-3">Payment Processing</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    All payments are processed securely through our third-party payment processors. We do not store your payment information.
                                </p>

                                <h3 className="text-xl font-medium mb-3">Refunds</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be submitted within 30 days of purchase.
                                </p>

                                <h3 className="text-xl font-medium mb-3">Cancellation</h3>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
                                </p>
                            </div>

                            {/* Disclaimers */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    The Platform is provided "as is" and "as available" without any warranties of any kind. We disclaim all warranties, express or implied, including but not limited to:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-[#706f6c] dark:text-[#A1A09A] space-y-2">
                                    <li>Warranties of merchantability and fitness for a particular purpose</li>
                                    <li>Warranties that the Platform will be uninterrupted or error-free</li>
                                    <li>Warranties regarding the accuracy or completeness of content</li>
                                    <li>Warranties that defects will be corrected</li>
                                </ul>
                            </div>

                            {/* Limitation of Liability */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    In no event shall SmartLearn be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                                </p>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Our total liability to you for any claims arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
                                </p>
                            </div>

                            {/* Indemnification */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    You agree to indemnify and hold harmless SmartLearn and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform or violation of these Terms.
                                </p>
                            </div>

                            {/* Governing Law */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
                                </p>
                            </div>

                            {/* Dispute Resolution */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
                                </p>
                            </div>

                            {/* Changes to Terms */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on the Platform and updating the "Last updated" date.
                                </p>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    Your continued use of the Platform after any changes constitutes acceptance of the new Terms.
                                </p>
                            </div>

                            {/* Severability */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">14. Severability</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.
                                </p>
                            </div>

                            {/* Entire Agreement */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">15. Entire Agreement</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    These Terms, together with our Privacy Policy, constitute the entire agreement between you and SmartLearn regarding the use of the Platform.
                                </p>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">16. Contact Information</h2>
                                <p className="text-[#706f6c] dark:text-[#A1A09A] mb-4">
                                    If you have any questions about these Terms, please contact us:
                                </p>
                                <div className="bg-[#FFF5F2] dark:bg-[#141413] p-6 rounded-lg">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A] mb-2">
                                        <strong>Email:</strong> legal@smartlearn.com
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
                        <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">Questions About Terms?</h2>
                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#d4d4d4]">
                            Our legal team is here to help clarify any questions about our terms of service.
                        </p>
                        <Link
                            href="#"
                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-medium text-[#1b1b18] shadow-lg hover:bg-[#f7f7f6] transition-all hover:shadow-xl"
                        >
                            Contact Legal Team
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
