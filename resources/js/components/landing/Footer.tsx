import { Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import AppLogo from '@/components/app-logo';

interface FooterLink {
    label: string;
    href: string;
    isExternal?: boolean;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

interface SocialLink {
    icon: React.ReactNode;
    href: string;
    label: string;
}

interface FooterProps {
    companyDescription?: string;
    sections?: FooterSection[];
    socialLinks?: SocialLink[];
    copyrightYear?: number;
    legalLinks?: FooterLink[];
    className?: string;
}

const defaultSections: FooterSection[] = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Courses', href: 'courses.index' },
            { label: 'Certificates', href: '#certificates' },
        ]
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: 'about' },
            { label: 'Blog', href: '#blog' },
            { label: 'Careers', href: '#careers' },
            { label: 'Contact', href: 'contact' },
        ]
    },
    {
        title: 'Support',
        links: [
            { label: 'Help Center', href: '#help' },
            { label: 'Privacy', href: 'privacy' },
            { label: 'Terms', href: 'terms' },
            { label: 'Status', href: '#status' },
        ]
    }
];

const defaultSocialLinks: SocialLink[] = [
    {
        icon: <Heart className="h-5 w-5" />,
        href: '#',
        label: 'Follow us'
    }
];

const defaultLegalLinks: FooterLink[] = [
    { label: 'Privacy', href: 'privacy' },
    { label: 'Terms', href: 'terms' },
];

export default function Footer({
    companyDescription = "Empowering learners worldwide with interactive, personalized education experiences.",
    sections = defaultSections,
    socialLinks = defaultSocialLinks,
    copyrightYear = new Date().getFullYear(),
    legalLinks = defaultLegalLinks,
    className = ""
}: FooterProps) {

    const renderLink = (link: FooterLink, index: number) => {
        const baseClasses = "block hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors";

        if (link.isExternal) {
            return (
                <a
                    key={index}
                    href={link.href}
                    className={baseClasses}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {link.label}
                </a>
            );
        }

        // Check if it's a hash link (anchor)
        if (link.href.startsWith('#')) {
            return (
                <a
                    key={index}
                    href={link.href}
                    className={baseClasses}
                >
                    {link.label}
                </a>
            );
        }

        return (
            <Link
                key={index}
                href={route(link.href)}
                className={baseClasses}
            >
                {link.label}
            </Link>
        );
    };

    return (
        <footer className={`bg-[#FDFDFC] py-12 text-sm text-[#706f6c] dark:bg-[#0a0a0a] dark:text-[#A1A09A] ${className}`}>
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                {/* Main Footer Content */}
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <AppLogo />
                        </div>
                        <p className="mb-4 text-sm leading-relaxed">
                            {companyDescription}
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="hover:text-[#f53003] dark:hover:text-[#FF4433] transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {sections.map((section, index) => (
                        <div key={index}>
                            <h3 className="mb-4 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                {section.title}
                            </h3>
                            <div className="space-y-2">
                                {section.links.map(renderLink)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Bottom */}
                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                        {/* Copyright */}
                        <p className="text-center md:text-left">
                            &copy; {copyrightYear} SmartLearn. All rights reserved.
                        </p>

                        {/* Legal Links */}
                        <div className="flex gap-4">
                            {legalLinks.map((link, index) => (
                                <span key={index}>
                                    {renderLink(link, index)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
