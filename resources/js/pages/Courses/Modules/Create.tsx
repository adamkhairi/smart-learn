import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleCreatePageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import InputError from '@/components/input-error';

function Create({ course, nextOrder }: CourseModuleCreatePageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        order: nextOrder,
        is_published: true as boolean,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: 'Create Module', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/courses/${course.id}/modules`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Module - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}/modules`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Modules
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create New Module</h1>
                        <p className="text-muted-foreground">Add a new learning module to {course.name}</p>
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
                                <CardDescription>Provide the basic information for your new module</CardDescription>
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
                                            placeholder="Enter module title (e.g., Introduction to React)"
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        <InputError message={errors.title} />
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
                                        <InputError message={errors.description} />
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
                                        <InputError message={errors.order} />
                                        <p className="text-xs text-muted-foreground">The order in which this module appears in the course</p>
                                    </div>

                                    {/* Published Status */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) => setData('is_published', checked === true)}
                                        />
                                        <Label htmlFor="is_published" className="cursor-pointer">
                                            Publish module immediately
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Published modules are visible to enrolled students. Unpublished modules remain hidden and can be worked on as
                                        drafts.
                                    </p>

                                    {/* Submit Actions */}
                                    <div className="flex items-center gap-4 border-t pt-6">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Creating...' : 'Create Module'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules`}>Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Tips and Guidelines */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">💡 Module Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Clear Titles</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Use descriptive titles that clearly indicate what the module covers.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Logical Sequence</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Order modules from basic to advanced concepts for better learning flow.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Manageable Size</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Keep modules focused on specific topics to avoid overwhelming students.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">📋 Next Steps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">After Creating</h4>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        <li>• Add module items (videos, documents, quizzes)</li>
                                        <li>• Set up learning objectives</li>
                                        <li>• Review and publish when ready</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">🎯 Course Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Current Modules</span>
                                        <span>{nextOrder - 1}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>This Module</span>
                                        <span>#{nextOrder}</span>
                                    </div>
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
