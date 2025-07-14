import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Course, type PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
    const { success, error } = useToast();

    const { data, setData, put, processing, errors } = useForm<CourseFormData>({
        _method: 'put',
        name: course.name,
        description: course.description || '',
        image: null as File | null,
        background_color: course.background_color || '',
        status: course.status,
        category_id: (course.category_id || '').toString(),
        level: course.level || '',
        duration: (course.duration || '').toString(),
        created_by: (course.created_by || '').toString(),
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null,
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('courses.update', course.id), {
            forceFormData: true,
            onSuccess: () => {
                success('Course updated successfully!');
            },
            onError: () => {
                error('Failed to update course. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(course.name)}>
            <Head title={`Edit ${course.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Course</h1>
                        <p className="text-muted-foreground">Update your course information and settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CourseForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        categories={categories}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                    />
                    <Button type="submit" disabled={processing} className="mt-4">
                        {processing ? 'Saving...' : 'Save Course'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
