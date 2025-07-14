import { Upload, X } from 'lucide-react';
import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Level } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Category {
    id: number;
    name: string;
}

type FormDataConvertible = string | number | boolean | File | null | undefined;

export interface CourseFormData extends Record<string, FormDataConvertible> {
    name: string;
    description: string;
    created_by: string;
    status: 'draft' | 'published' | 'archived';
    background_color: string;
    image: File | null;
    category_id: string;
    level: Level; // Changed from string to Level
    duration: string;
    image_removed?: boolean; // Add this line
}

interface CourseFormProps {
    data: CourseFormData;
    setData: ReturnType<typeof useForm<CourseFormData>>['setData'];
    errors: ReturnType<typeof useForm<CourseFormData>>['errors'];
    categories: Category[];
    imagePreview: string | null;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: () => void;
    processing: boolean;
}

export function CourseForm({
    data,
    setData,
    errors,
    categories,
    imagePreview,
    handleImageChange,
    removeImage,
}: CourseFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Information</CardTitle>
                        <CardDescription>Basic information about the course</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter course name"
                            />
                            {errors?.name && <InputError message={errors.name} />}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter course description"
                                rows={4}
                            />
                            {errors?.description && <InputError message={errors.description} />}
                        </div>

                        {/* New Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.category_id && <InputError message={errors.category_id} />}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Select value={data.level} onValueChange={(value) => setData('level', value as Level)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level">
                                        {data.level}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="All Levels">All Levels</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors?.level && <InputError message={errors.level} />}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (in hours)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={data.duration}
                                onChange={(e) => setData('duration', e.target.value)}
                                placeholder="e.g., 10, 20, 40"
                            />
                            {errors?.duration && <InputError message={errors.duration} />}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value as 'draft' | 'published' | 'archived')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors?.status && <InputError message={errors.status} />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Course Image */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Image</CardTitle>
                        <CardDescription>Upload a course cover image</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {imagePreview ? (
                            <div className="relative">
                                <AspectRatio ratio={16 / 9}>
                                    <img src={imagePreview} alt="Course preview" className="w-full rounded-lg object-cover" />
                                </AspectRatio>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        removeImage();
                                        setData('image_removed', true); // Set image_removed to true
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">Click to upload course image</p>
                                <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    <Button type="button" variant="outline" size="sm" onClick={handleButtonClick}>
                                        Choose Image
                                    </Button>
                                </Label>
                            </div>
                        )}
                        {errors?.image && <InputError message={errors.image} />}
                    </CardContent>
                </Card>

                {/* Background Color */}
                <Card>
                    <CardHeader>
                        <CardTitle>Background Color</CardTitle>
                        <CardDescription>Choose a color for the course</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorPicker value={data.background_color} onChange={(value) => setData('background_color', value)} />
                        {errors?.background_color && <InputError message={errors.background_color} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
