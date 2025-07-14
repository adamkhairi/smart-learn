import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import AppLayout from '@/layouts/app-layout';
import { CourseForm, CourseFormData } from '@/components/course-form';
import { Course, User as Instructor } from '@/types';

interface Category {
    id: number;
    name: string;
}

interface Props {
    course: Course;
    instructors: Instructor[];
    categories: Category[];
    errors?: Record<string, string>;
}

export default function Edit({ course, instructors, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm<CourseFormData>({
        name: course.name,
        description: course.description || '',
        created_by: (course.created_by || '').toString(),
        status: course.status,
        background_color: course.background_color || '',
        image: null as File | null,
        category_id: (course.category_id || '').toString(),
        level: course.level || '',
        duration: (course.duration || '').toString(),
        _method: 'put', // Ensure _method is set for useForm
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null,
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);

        post(route('admin.courses.update', course.id), {
            forceFormData: true,
            onSuccess: () => {
                router.visit(route('admin.courses.index'));
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit ${course.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.get(route('admin.courses.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
                        <p className="text-muted-foreground">Update course information and settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CourseForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        instructors={instructors}
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
