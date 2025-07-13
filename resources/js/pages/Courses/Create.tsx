import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload } from 'lucide-react';
import InputError from '@/components/input-error';
import { useToast } from '@/hooks/use-toast';

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

function Create() {
    // Initialize flash toast notifications
    const { success, error } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null as File | null,
        background_color: '#3B82F6',
        status: 'published' as 'published' | 'archived',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/courses', {
            onSuccess: () => {
                success('Course created successfully!');
            },
            onError: () => {
                error('Failed to create course. Please check the form for errors.');
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
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

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>Fill in the details below to create your new course</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Course Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Course Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter course name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <InputError message={errors.name} />}
                            </div>

                            {/* Course Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe your course..."
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && <InputError message={errors.description} />}
                            </div>

                            {/* Course Image */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Course Image</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.image && <InputError message={errors.image} />}
                                <p className="text-xs text-muted-foreground">Recommended size: 1200x630px. Max file size: 2MB.</p>
                            </div>

                            {/* Background Color */}
                            <div className="space-y-2">
                                <ColorPicker
                                    value={data.background_color}
                                    onChange={(color) => setData('background_color', color)}
                                    label="Background Color"
                                    error={errors.background_color}
                                />
                            </div>

                            {/* Course Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value as 'published' | 'archived')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <InputError message={errors.status} />}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Course'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/courses">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default Create;
