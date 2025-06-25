import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseEditPageProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Palette, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: 'Edit Course',
        href: '#',
    },
];

function Edit({ course }: CourseEditPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: course.name,
        description: course.description || '',
        image: null as File | null,
        background_color: course.background_color || '',
        status: course.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/courses/${course.id}`);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
    };

    const generateRandomColor = () => {
        const color = '#' + Math.floor(Math.random()*16777215).toString(16);
        setData('background_color', color);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${course.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Course</h1>
                        <p className="text-muted-foreground">
                            Update your course information and settings
                        </p>
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>
                            Update the details below to modify your course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-medium">Basic Information</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Essential details about your course
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Course Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as 'published' | 'archived')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-500">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Course Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe your course objectives, target audience, and what students will learn..."
                                        rows={8}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Visual Customization Section */}
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-medium">Visual Customization</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Customize the appearance of your course
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Course Image */}
                                    <div className="space-y-4">
                                        <Label htmlFor="image">Course Image</Label>

                                        {/* Current Image Preview */}
                                        {course.image && (
                                            <div className="relative">
                                                <img
                                                    src={`/storage/${course.image}`}
                                                    alt="Current course image"
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                    Current
                                                </div>
                                            </div>
                                        )}

                                        {/* File Upload */}
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                            <div className="text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <div className="mt-2">
                                                    <Input
                                                        id="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor="image"
                                                        className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                                                    >
                                                        Choose new image
                                                    </label>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG, GIF up to 2MB<br/>
                                                    Recommended: 1200x630px
                                                </p>
                                            </div>
                                        </div>

                                        {errors.image && (
                                            <p className="text-sm text-red-500">{errors.image}</p>
                                        )}
                                    </div>

                                    {/* Background Color */}
                                    <div className="space-y-4">
                                        <Label htmlFor="background_color">Background Color</Label>

                                        <div className="space-y-4">
                                            {/* Color Preview */}
                                            <div
                                                className="w-full h-20 rounded-lg border shadow-sm"
                                                style={{ backgroundColor: data.background_color || '#f3f4f6' }}
                                            />

                                            {/* Color Controls */}
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    id="background_color"
                                                    type="color"
                                                    value={data.background_color}
                                                    onChange={(e) => setData('background_color', e.target.value)}
                                                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                                                />
                                                <Input
                                                    type="text"
                                                    value={data.background_color}
                                                    onChange={(e) => setData('background_color', e.target.value)}
                                                    placeholder="#000000"
                                                    className="font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={generateRandomColor}
                                                >
                                                    <Palette className="mr-2 h-4 w-4" />
                                                    Random
                                                </Button>
                                            </div>
                                        </div>

                                        {errors.background_color && (
                                            <p className="text-sm text-red-500">{errors.background_color}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={`/courses/${course.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default Edit;
