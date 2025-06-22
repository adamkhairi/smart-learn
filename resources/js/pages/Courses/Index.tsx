import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CoursesPageProps } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
];

function Index({ courses }: CoursesPageProps) {
    console.log('Courses:', courses);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">Courses</h1>
                    {courses.map((course) => (
                        <div key={course.id} className="">
                            <p>{course.name}</p>
                            {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        </div>
                    ))}
            </div>
        </AppLayout>
    );
}

export default Index;
