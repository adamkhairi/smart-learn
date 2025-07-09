import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { useFlashToast } from '@/hooks/use-flash-toast';

interface Instructor {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  created_by: number;
  status: 'draft' | 'published' | 'archived';
  image?: string;
  background_color: string;
}

interface Props {
  course: Course;
  instructors: Instructor[];
  errors?: Record<string, string>;
}

export default function Edit({ course, instructors, errors }: Props) {
  // Initialize flash toast notifications
  useFlashToast();

  const [formData, setFormData] = useState({
    name: course.name,
    description: course.description || '',
    created_by: course.created_by.toString(),
    status: course.status,
    background_color: course.background_color,
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    course.image ? (course.image.startsWith('http') ? course.image : `/storage/${course.image}`) : null
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append('_method', 'PUT');
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('created_by', formData.created_by);
    data.append('status', formData.status);
    data.append('background_color', formData.background_color);

    if (formData.image) {
      data.append('image', formData.image);
    }

    router.post(route('admin.courses.update', course.id), data);
  };

  const generateRandomColor = () => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setFormData(prev => ({ ...prev, background_color: randomColor }));
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
            <p className="text-muted-foreground">
              Update course information and settings
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Update basic information about the course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter course name"
                    />
                    {errors?.name && <InputError message={errors.name} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter course description"
                      rows={4}
                    />
                    {errors?.description && <InputError message={errors.description} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="created_by">Course Creator *</Label>
                    <Select value={formData.created_by} onValueChange={(value) => handleInputChange('created_by', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course creator" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name} ({instructor.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.created_by && <InputError message={errors.created_by} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                  <CardDescription>
                    Update the course cover image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload course image
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" type="button" asChild>
                          <span>Choose Image</span>
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
                  <CardDescription>
                    Choose a color for the course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: formData.background_color }}
                    />
                    <Input
                      value={formData.background_color}
                      onChange={(e) => handleInputChange('background_color', e.target.value)}
                      placeholder="#3B82F6"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomColor}
                    >
                      Random
                    </Button>
                  </div>
                  {errors?.background_color && <InputError message={errors.background_color} />}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.get(route('admin.courses.index'))}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Course
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
