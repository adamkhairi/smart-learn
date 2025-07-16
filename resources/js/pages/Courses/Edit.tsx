import { CourseForm, CourseFormData } from '@/components/course-form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course, type Level, type PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

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
        course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null,
    );

    const { data, setData, post, processing, errors } = useForm<CourseFormData>({
        name: course.name,
        description: course.description || '',
        image: null as File | null,
        status: course.status,
        is_private: course.is_private ?? false, // Initialize is_private
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
        <AppLayout breadcrumbs={breadcrumbs(course.name)}>
            <Head title={`Edit ${course.name}`} />
            <div className="mt-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('courses.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit {course.name}</h1>
                        <p className="text-muted-foreground">Update your course with all the essential details</p>
                    </div>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post(route('courses.update', course.id));
                    }}
                >
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
                    <Button className="mt-4" type="submit" disabled={processing}>
                        Update Course
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
