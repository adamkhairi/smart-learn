import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemCreatePageProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, FileText, Play, Link as LinkIcon, HelpCircle, ClipboardList, Upload } from 'lucide-react';
import { useState } from 'react';

function Create({ course, module, nextOrder }: CourseModuleItemCreatePageProps) {
    const [selectedType, setSelectedType] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        type: '' as 'video' | 'document' | 'link' | 'quiz' | 'assignment',
        url: '',
        content: '',
        file: null as File | null,
        order: nextOrder,
        duration: '',
        is_required: false,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: 'Add Item', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/courses/${course.id}/modules/${module.id}/items`);
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setData('type', type as 'video' | 'document' | 'link' | 'quiz' | 'assignment');
        // Reset type-specific fields
        setData(prev => ({
            ...prev,
            url: '',
            content: '',
            file: null,
            duration: type === 'video' ? prev.duration : '',
        }));
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
            <Head title={`Add Item - ${module.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Module
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Module Item</h1>
                        <p className="text-muted-foreground">
                            Add content to "{module.title}"
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
                                    Configure your new module item
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
                                        <div className="space-y-2">
                                            <Label htmlFor="file">Upload File *</Label>
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
                                                            Selected: {data.file.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {errors.file && (
                                                <p className="text-sm text-red-500">{errors.file}</p>
                                            )}
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
                                        <Button type="submit" disabled={processing || !selectedType}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Adding...' : 'Add Item'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}`}>
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
                                <CardTitle className="text-lg">📋 Module Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Module</span>
                                        <span>{module.title}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Current Items</span>
                                        <span>{nextOrder - 1}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>This Item</span>
                                        <span>#{nextOrder}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">💡 Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Content Quality</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Use clear, descriptive titles and provide helpful descriptions.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Organization</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Order items logically from basic concepts to advanced topics.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">Engagement</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Mix different content types to keep students engaged.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Create;
