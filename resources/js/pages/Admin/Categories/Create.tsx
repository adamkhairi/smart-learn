import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

interface CategoryFormData {
    name: string;
    slug: string;
    [key: string]: string;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<CategoryFormData>({
        name: '',
        slug: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.categories.store'), {
            onSuccess: () => {
                router.visit(route('admin.categories.index'));
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Create Category" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.get(route('admin.categories.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Categories
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
                        <p className="text-muted-foreground">Set up a new category for organizing courses</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                            <CardDescription>Enter the name and slug for the new category.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    required
                                />
                                <InputError message={errors.slug} className="mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={processing} className="mt-4">
                        {processing ? 'Creating...' : 'Create Category'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
