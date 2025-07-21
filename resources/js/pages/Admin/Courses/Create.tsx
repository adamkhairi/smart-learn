import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

import AppLayout from '@/layouts/app-layout';
import { CourseForm, CourseFormData } from '@/components/course-form';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function Create({ categories }: Props) {
    const { user } = useAuth();
    const { data, setData, post, processing, errors: formErrors } = useForm<CourseFormData>({
        name: '',
        description: '',
        created_by: user?.id?.toString() || '',
        status: 'draft',
        background_color: '#3B82F6',
        image: null as File | null,
        category_id: '',
        level: 'All Levels',
        duration: '',
        is_private: false,
    });

    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Courses', href: '/admin/courses' },
        { title: 'Create', href: '#' },
    ];

    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        console.log('handleSubmit triggered');

        post(route('admin.courses.store'), {
            forceFormData: true,
            onSuccess: () => {
                router.visit(route('admin.courses.index'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.get(route('admin.courses.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
                        <p className="text-muted-foreground">Set up a new course with all necessary details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CourseForm
                        data={data}
                        setData={setData}
                        errors={formErrors}
                        categories={categories}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                        removeImage={removeImage}
                        processing={processing}
                    />
                    <Button type="submit" disabled={processing} className="mt-4">
                        {processing ? 'Creating...' : 'Create Course'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}

