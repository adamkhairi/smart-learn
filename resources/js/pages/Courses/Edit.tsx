import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course, type PageProps, type Level } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { CourseForm, CourseFormData } from '@/components/course-form';

interface Category {
    id: number;
    name: string;
}

const breadcrumbs = (courseName: string): BreadcrumbItem[] => [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: `Edit ${courseName}`,
        href: '#',
    },
];

interface CourseEditPageProps extends PageProps {
    course: Course;
    categories: Category[];
}

export default function Edit({ course, categories }: CourseEditPageProps) {
    const [currentImagePreview, setCurrentImagePreview] = React.useState<string | null>(
        course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null
    );

    const { data, setData, post, processing, errors } = useForm<CourseFormData>({
        name: course.name,
        description: course.description || '',
        image: null as File | null,
        status: course.status,
        background_color: course.background_color || '',
        category_id: (course.category_id || '').toString(),
        level: course.level as Level,
        duration: (course.duration || '').toString(),
        created_by: (course.created_by || '').toString(),
        _method: 'put', // Explicitly add method spoofing
        image_removed: false, // Initialize image_removed flag
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            setCurrentImagePreview(URL.createObjectURL(file));
            setData('image_removed', false); // A new image is selected, so it's not removed
        } else {
            setCurrentImagePreview(null);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setData('image_removed', true); // Explicitly set the flag for backend
        setCurrentImagePreview(null); // Instantly remove the existing image from the preview
    };

    return (
        <AppLayout
            breadcrumbs={breadcrumbs(course.name)}
        >
            <Head title={`Edit ${course.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-x-3">
                    <Link
                        href={route('courses.index')}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Edit {course.name}
                    </h1>
                </div>
                <form onSubmit={e => {
                    e.preventDefault();
                    post(route('courses.update', course.id));
                }}>
                    <CourseForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        categories={categories}
                        processing={processing}
                        imagePreview={currentImagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                    />
                    <Button type="submit" disabled={processing}>
                        Update Course
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
