import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseEditPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { ColorPicker } from '@/components/ui/color-picker';
import { useToast } from '@/hooks/use-toast';

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
    // Initialize flash toast notifications
    useFlashToast();
    const { success, error } = useToast();

    const [formData, setFormData] = useState({
        name: course.name,
        description: course.description || '',
        background_color: course.background_color || '#3B82F6',
        status: course.status,
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null,
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const data = new FormData();
        data.append('_method', 'PUT');
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('background_color', formData.background_color);
        data.append('status', formData.status);

        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post(`/courses/${course.id}`, data, {
            onSuccess: () => {
                setProcessing(false);
                success('Course updated successfully!');
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
                error('Failed to save changes. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${course.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Course</h1>
                        <p className="text-muted-foreground">Update your course information and settings</p>
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>Update the details below to modify your course</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-medium">Basic Information</h3>
                                    <p className="text-sm text-muted-foreground">Essential details about your course</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Course Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Course Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter course name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <InputError message={errors.name} />}
                                    </div>

                                    {/* Course Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                                </div>

                                {/* Course Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe your course objectives, target audience, and what students will learn..."
                                        rows={8}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <InputError message={errors.description} />}
                                </div>
                            </div>

                            {/* Visual Customization Section */}
                            <div className="space-y-6">
                                <div className="border-b pb-4">
                                    <h3 className="text-lg font-medium">Visual Customization</h3>
                                    <p className="text-sm text-muted-foreground">Customize the appearance of your course</p>
                                </div>

                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                    {/* Course Image */}
                                    <div className="space-y-4">
                                        <Label htmlFor="image">Course Image</Label>

                                        {/* Image Preview */}
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Course preview" className="h-32 w-full rounded-lg border object-cover" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onClick={removeImage}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                {!formData.image && course.image && (
                                                    <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                                        Current
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-gray-400">
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
                                                        <Label htmlFor="image" className="cursor-pointer">
                                                            <Button variant="outline" size="sm" type="button" asChild>
                                                                <span>Choose new image</span>
                                                            </Button>
                                                        </Label>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        PNG, JPG, GIF up to 2MB
                                                        <br />
                                                        Recommended: 1200x630px
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {errors.image && <InputError message={errors.image} />}
                                    </div>

                                    {/* Background Color */}
                                    <div className="space-y-2">
                                        <ColorPicker
                                            value={formData.background_color}
                                            onChange={(color) => handleInputChange('background_color', color)}
                                            label="Background Color"
                                            error={errors.background_color}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center gap-4 border-t pt-6">
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
