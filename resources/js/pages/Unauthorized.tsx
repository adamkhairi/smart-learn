import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { Lock, Rocket, Ban } from 'lucide-react';

export default function Unauthorized() {
    const breadcrumbs = [
        { title: 'Home', href: '/' },
        { title: 'Unauthorized', href: '#' },
    ];
    return (
        <PublicLayout title="Unauthorized Access – SmartLearn" breadcrumbs={breadcrumbs}>
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <Head title="Unauthorized - Access Denied" />

                <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
                    {/* 403 Illustration */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#FFEFEA] dark:bg-[#2A1A17]">
                                <Ban className="h-20 w-20 text-[#f53003] dark:text-[#FF4433]" />
                            </div>
                            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f53003] text-sm font-medium text-white dark:bg-[#FF4433]">
                                <Lock className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
                        Access Denied!
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                        It seems you've stumbled into a VIP section without the proper credentials. Even our pixelated security guard says no!
                    </p>

                    {/* Quick Actions */}
                    <div className="mb-12 grid gap-4 sm:grid-cols-2">
                        <Link
                            href={route('home')}
                            className="group flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] bg-white p-4 shadow-sm transition-all hover:border-[#f53003]/20 hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                        >
                            <Rocket className="h-5 w-5 text-[#f53003] dark:text-[#FF4433] transition-transform group-hover:-rotate-45" />
                            <span className="font-medium">Back to Safety</span>
                        </Link>
                        <Link
                            href={route('courses.index')}
                            className="group flex items-center justify-center gap-2 rounded-lg border border-[#e3e3e0] bg-white p-4 shadow-sm transition-all hover:border-[#f53003]/20 hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#FF4433]/20"
                        >
                            <Ban className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" />
                            <span className="font-medium">Browse Public Courses</span>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact support with a screenshot of your bewildered face.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
