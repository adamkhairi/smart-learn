import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CourseForm, CourseFormData } from '@/components/course-form';
import { useAuth } from '@/hooks/use-auth';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: 'Create Course',
        href: '/courses/create',
    },
];

function Create({ categories }: Props) {
    // Initialize flash toast notifications
    const { success, error } = useToast();
    const { user } = useAuth();

    const { data, setData, post, processing, errors } = useForm<CourseFormData>({
        name: '',
        description: '',
        image: null as File | null,
        background_color: '#3B82F6',
        status: 'published',
        is_private: false, // Initialize is_private
        category_id: '',
        level: 'All Levels',
        duration: '',
        created_by: user?.id?.toString() || '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        post(route('courses.store'), {
            forceFormData: true,
            onSuccess: () => {
                success('Course created successfully!');
            },
            onError: () => {
                error('Failed to create course. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Course" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create New Course</h1>
                        <p className="text-muted-foreground">Set up your course with all the essential details</p>
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

export default Create;
