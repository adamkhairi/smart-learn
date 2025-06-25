import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemEditPageProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, FileText, Play, Link as LinkIcon, HelpCircle, ClipboardList, Upload, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

function Edit({ course, module, item }: CourseModuleItemEditPageProps) {
    const [selectedType, setSelectedType] = useState<string>(item.type);

    const { data, setData, put, processing, errors } = useForm({
        title: item.title,
        description: item.description || '',
        type: item.type,
        url: item.url || '',
        content: item.content || '',
        file: null as File | null,
        order: item.order,
        duration: item.duration ? item.duration.toString() : '',
        is_required: item.is_required,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: item.title, href: `/courses/${course.id}/modules/${module.id}/items/${item.id}` },
        { title: 'Edit', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/courses/${course.id}/modules/${module.id}/items/${item.id}`);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setData('type', type as 'video' | 'document' | 'link' | 'quiz' | 'assignment');
        // Reset type-specific fields when changing type
        if (type !== item.type) {
            setData(prev => ({
                ...prev,
                url: '',
                content: '',
                file: null,
                duration: type === 'video' ? prev.duration : '',
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);
    };

    const itemTypes = [
        {
            value: 'video',
            label: 'Video',
            icon: <Play className="h-4 w-4" />,
            description: 'Video content (YouTube, Vimeo, etc.)',
            color: 'text-blue-500'
        },
        {
            value: 'document',
            label: 'Document',
            icon: <FileText className="h-4 w-4" />,
            description: 'PDF, Word, PowerPoint, or other files',
            color: 'text-green-500'
        },
        {
            value: 'link',
            label: 'External Link',
            icon: <LinkIcon className="h-4 w-4" />,
            description: 'Links to external resources',
            color: 'text-purple-500'
        },
        {
            value: 'quiz',
            label: 'Quiz',
            icon: <HelpCircle className="h-4 w-4" />,
            description: 'Interactive quiz or assessment',
            color: 'text-orange-500'
        },
        {
            value: 'assignment',
            label: 'Assignment',
            icon: <ClipboardList className="h-4 w-4" />,
            description: 'Homework or project assignment',
            color: 'text-red-500'
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${item.title} - ${module.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Item
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Item</h1>
                        <p className="text-muted-foreground">
                            Update "{item.title}" in {module.title}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Details</CardTitle>
                                <CardDescription>
                                    Update the configuration for this module item
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Item Type Selection */}
                                    <div className="space-y-3">
                                        <Label>Item Type *</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {itemTypes.map((type) => (
                                                <div
                                                    key={type.value}
                                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                        selectedType === type.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                    onClick={() => handleTypeChange(type.value)}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={type.color}>{type.icon}</span>
                                                        <span className="font-medium">{type.label}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {type.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.type && (
                                            <p className="text-sm text-red-500">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Item Title *</Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Enter item title"
                                                className={errors.title ? 'border-red-500' : ''}
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-500">{errors.title}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Describe this item..."
                                                rows={3}
                                                className={errors.description ? 'border-red-500' : ''}
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-500">{errors.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Type-specific fields */}
                                    {(selectedType === 'video' || selectedType === 'link') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="url">
                                                {selectedType === 'video' ? 'Video URL *' : 'Link URL *'}
                                            </Label>
                                            <Input
                                                id="url"
                                                type="url"
                                                value={data.url}
                                                onChange={(e) => setData('url', e.target.value)}
                                                placeholder={
                                                    selectedType === 'video'
                                                        ? "https://www.youtube.com/watch?v=..."
                                                        : "https://example.com"
                                                }
                                                className={errors.url ? 'border-red-500' : ''}
                                            />
                                            {errors.url && (
                                                <p className="text-sm text-red-500">{errors.url}</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedType === 'document' && (
                                        <div className="space-y-4">
                                            {/* Current file display */}
                                            {item.url && item.type === 'document' && (
                                                <div className="p-4 border rounded-lg bg-muted">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">Current Document</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {item.url.split('/').pop()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a
                                                                href={`/storage/${item.url}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* File upload */}
                                            <div className="space-y-2">
                                                <Label htmlFor="file">
                                                    {item.url ? 'Replace File' : 'Upload File *'}
                                                </Label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                                    <div className="text-center">
                                                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                        <Input
                                                            id="file"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor="file"
                                                            className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                                                        >
                                                            Choose file to upload
                                                        </label>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            PDF, Word, PowerPoint, Excel, or text files (max 10MB)
                                                        </p>
                                                        {data.file && (
                                                            <p className="text-sm text-green-600 mt-2">
                                                                New file: {data.file.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {errors.file && (
                                                    <p className="text-sm text-red-500">{errors.file}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(selectedType === 'quiz' || selectedType === 'assignment') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Content *</Label>
                                            <Textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                placeholder={
                                                    selectedType === 'quiz'
                                                        ? "Quiz instructions and questions..."
                                                        : "Assignment description and requirements..."
                                                }
                                                rows={8}
                                                className={errors.content ? 'border-red-500' : ''}
                                            />
                                            {errors.content && (
                                                <p className="text-sm text-red-500">{errors.content}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Duration (for videos) */}
                                    {selectedType === 'video' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (seconds)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                min="0"
                                                value={data.duration}
                                                onChange={(e) => setData('duration', e.target.value)}
                                                placeholder="e.g., 300 for 5 minutes"
                                                className={errors.duration ? 'border-red-500' : ''}
                                            />
                                            {errors.duration && (
                                                <p className="text-sm text-red-500">{errors.duration}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Order */}
                                    <div className="space-y-2">
                                        <Label htmlFor="order">Order</Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            min="1"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                                            className={errors.order ? 'border-red-500' : ''}
                                        />
                                        {errors.order && (
                                            <p className="text-sm text-red-500">{errors.order}</p>
                                        )}
                                    </div>

                                    {/* Required checkbox */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_required"
                                            checked={data.is_required}
                                            onCheckedChange={(checked) => setData('is_required', Boolean(checked))}
                                        />
                                        <Label htmlFor="is_required" className="cursor-pointer">
                                            This item is required for course completion
                                        </Label>
                                    </div>

                                    {/* Submit Actions */}
                                    <div className="flex items-center gap-4 pt-6 border-t">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📋 Item Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Current Type</span>
                                        <span className="capitalize">{item.type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Current Order</span>
                                        <span>#{item.order}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Required</span>
                                        <span>{item.is_required ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Created</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">💡 Editing Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Type Changes</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Changing the type will reset type-specific content.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">File Updates</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Uploading a new file will replace the existing one.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Order Changes</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Changing order will reorder other items automatically.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">🚀 Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                        View Item
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                    <Link href={`/courses/${course.id}/modules/${module.id}`}>
                                        Back to Module
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Edit;
