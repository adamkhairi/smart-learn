import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleEditPageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Eye, EyeOff, Save } from 'lucide-react';

function Edit({ course, module }: CourseModuleEditPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: module.title,
        description: module.description || '',
        order: module.order,
        is_published: module.is_published,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: 'Edit', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/courses/${course.id}/modules/${module.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${module.title} - ${course.name}`} />

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
                        <h1 className="text-2xl font-bold">Edit Module</h1>
                        <p className="text-muted-foreground">Update the details for "{module.title}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Module Details
                                </CardTitle>
                                <CardDescription>Update the information for this module</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Module Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Module Title *</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter module title"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Module Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe what students will learn in this module..."
                                            rows={8}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            Provide a clear overview of the module content and learning objectives
                                        </p>
                                    </div>

                                    {/* Module Order */}
                                    <div className="space-y-2">
                                        <Label htmlFor="order">Module Order</Label>
                                        <Input
                                            id="order"
                                            type="number"
                                            min="1"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                                            className={errors.order ? 'border-red-500' : ''}
                                        />
                                        {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
                                        <p className="text-xs text-muted-foreground">The order in which this module appears in the course</p>
                                    </div>

                                    {/* Published Status */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', Boolean(checked))}
                                        />
                                        <Label htmlFor="is_published" className="cursor-pointer">
                                            Module is published
                                        </Label>
                                        {data.is_published ? (
                                            <Eye className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-orange-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Published modules are visible to enrolled students. Unpublished modules remain hidden and can be worked on as
                                        drafts.
                                    </p>

                                    {/* Submit Actions */}
                                    <div className="flex items-center gap-4 border-t pt-6">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}`}>Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Module Info & Tips */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📊 Module Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Current Order</span>
                                        <span>#{module.order}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Status</span>
                                        <span className={module.is_published ? 'text-green-600' : 'text-orange-600'}>
                                            {module.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Items</span>
                                        <span>{module.itemsCount || 0}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Created</span>
                                        <span>{new Date(module.created_at).toLocaleDateString()}</span>
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
                                    <h4 className="mb-2 text-sm font-medium">Order Changes</h4>
                                    <p className="text-sm text-muted-foreground">Changing the order will automatically reorder other modules.</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Publishing</h4>
                                    <p className="text-sm text-muted-foreground">Only published modules are visible to students.</p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Content Management</h4>
                                    <p className="text-sm text-muted-foreground">Add items to your module from the module view page.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">🚀 Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>Add Module Item</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                    <Link href={`/courses/${course.id}/modules/${module.id}`}>View Module</Link>
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
