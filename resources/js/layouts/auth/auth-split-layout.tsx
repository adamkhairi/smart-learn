import AppLogo from '@/components/app-logo';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    isRegisterPage?: boolean;
}

export default function AuthSplitLayout({ children, title, description, isRegisterPage }: PropsWithChildren<AuthLayoutProps>) {
    const { quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                {/* Centered logo at the top */}
                <div className="relative z-20 flex flex-col items-center mt-4 mb-8">
                    <Link href={route('home')} className="flex items-center justify-center">
                        <AppLogo forceWhite />
                    </Link>
                </div>
                {/* Large illustration below the logo */}
                <div className="relative z-20 flex flex-col items-center justify-center flex-1">
                    {isRegisterPage ? (
                        <img src="/Add User-amico.svg" alt="Register Illustration" className="w-[420px] max-w-full h-auto" />
                    ) : (
                        <img src="/Login-amico.svg" alt="Login Illustration" className="w-[420px] max-w-full h-auto" />
                    )}
                </div>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogo />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
