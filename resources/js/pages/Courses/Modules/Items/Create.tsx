import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemCreatePageProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Play, HelpCircle, ClipboardList } from 'lucide-react';
import { useState } from 'react';

function Create({ course, module, nextOrder }: CourseModuleItemCreatePageProps) {
    const [selectedType, setSelectedType] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        item_type: '' as 'lecture' | 'assessment' | 'assignment',
        // Lecture fields
        video_url: '',
        duration: '',
        content: '',
        // Assessment fields
        assessment_title: '',
        max_score: '',
        assessment_type: 'quiz' as 'quiz' | 'exam' | 'project',
        questions_type: 'online' as 'online' | 'file',
        submission_type: 'online' as 'online' | 'written',
        // Assignment fields
        assignment_title: '',
        total_points: '',
        assignment_type: '',
        started_at: '',
        expired_at: '',
        // Common fields
        order: nextOrder,
        is_required: false,
        status: 'published' as 'draft' | 'published',
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

        // Ensure type is set
        if (!data.item_type) {
            console.error('Item type not selected');
            return;
        }

        // Type-specific validation
        if (data.item_type === 'lecture' && !data.video_url) {
            console.error('Video URL required for lecture');
            return;
        }

        if (data.item_type === 'assessment' && !data.assessment_title) {
            console.error('Assessment title required');
            return;
        }

        if (data.item_type === 'assignment' && !data.assignment_title) {
            console.error('Assignment title required');
            return;
        }

        const options = {
            onSuccess: () => {
                console.log('Module item created successfully');
            },
            onError: (errors: Record<string, string>) => {
                console.error('Form submission errors:', errors);
            }
        };

        post(`/courses/${course.id}/modules/${module.id}/items`, options);
    };

    const handleTypeChange = (type: string) => {
        console.log('Changing type to:', type);
        setSelectedType(type);

        setData(prev => ({
            ...prev,
            item_type: type as 'lecture' | 'assessment' | 'assignment',
            // Reset type-specific fields
            video_url: '',
            content: '',
            duration: '',
            assessment_title: '',
            max_score: '',
            assignment_title: '',
            total_points: '',
            assignment_type: '',
            started_at: '',
            expired_at: '',
        }));
    };

    // Validation helpers
    const isFormValid = () => {
        if (!data.title.trim() || !data.item_type) return false;

        switch (data.item_type) {
            case 'lecture':
                return data.video_url.trim();
            case 'assessment':
                return data.assessment_title.trim();
            case 'assignment':
                return data.assignment_title.trim();
            default:
                return false;
        }
    };

    const itemTypes = [
        {
            value: 'lecture',
            label: 'Lecture',
            icon: <Play className="h-4 w-4" />,
            description: 'Video content (YouTube, Vimeo, etc.)',
            color: 'text-blue-500'
        },
        {
            value: 'assessment',
            label: 'Assessment',
            icon: <HelpCircle className="h-4 w-4" />,
            description: 'Quiz, exam, or project assessment',
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

    const getSubmitButtonText = () => {
        if (processing) {
            return 'Adding...';
        }
        return 'Add Item';
    };

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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                                    <div className="flex items-center gap-3">
                                                        <div className={type.color}>
                                                            {type.icon}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {type.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.item_type && (
                                            <p className="text-sm text-destructive">{errors.item_type}</p>
                                        )}
                                    </div>

                                    {/* Common Fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Module Item Title *</Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Enter the module item title"
                                                className={errors.title ? 'border-destructive' : ''}
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-destructive mt-1">{errors.title}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Enter a description for this item"
                                                rows={3}
                                                className={errors.description ? 'border-destructive' : ''}
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-destructive mt-1">{errors.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Type-specific Fields */}
                                    {data.item_type === 'lecture' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Lecture Content</h3>

                                            <div>
                                                <Label htmlFor="video_url">Video URL *</Label>
                                                <Input
                                                    id="video_url"
                                                    type="url"
                                                    value={data.video_url}
                                                    onChange={(e) => setData('video_url', e.target.value)}
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    className={errors.video_url ? 'border-destructive' : ''}
                                                />
                                                {errors.video_url && (
                                                    <p className="text-sm text-destructive mt-1">{errors.video_url}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="duration">Duration (seconds)</Label>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    value={data.duration}
                                                    onChange={(e) => setData('duration', e.target.value)}
                                                    placeholder="e.g., 300 for 5 minutes"
                                                    className={errors.duration ? 'border-destructive' : ''}
                                                />
                                                {errors.duration && (
                                                    <p className="text-sm text-destructive mt-1">{errors.duration}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="content">Additional Content</Label>
                                                <Textarea
                                                    id="content"
                                                    value={data.content}
                                                    onChange={(e) => setData('content', e.target.value)}
                                                    placeholder="Additional lecture notes or description"
                                                    rows={4}
                                                    className={errors.content ? 'border-destructive' : ''}
                                                />
                                                {errors.content && (
                                                    <p className="text-sm text-destructive mt-1">{errors.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {data.item_type === 'assessment' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Assessment Settings</h3>

                                            <div>
                                                <Label htmlFor="assessment_title">Assessment Title *</Label>
                                                <Input
                                                    id="assessment_title"
                                                    type="text"
                                                    value={data.assessment_title}
                                                    onChange={(e) => setData('assessment_title', e.target.value)}
                                                    placeholder="Enter assessment title"
                                                    className={errors.assessment_title ? 'border-destructive' : ''}
                                                />
                                                {errors.assessment_title && (
                                                    <p className="text-sm text-destructive mt-1">{errors.assessment_title}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="max_score">Maximum Score</Label>
                                                    <Input
                                                        id="max_score"
                                                        type="number"
                                                        value={data.max_score}
                                                        onChange={(e) => setData('max_score', e.target.value)}
                                                        placeholder="100"
                                                        className={errors.max_score ? 'border-destructive' : ''}
                                                    />
                                                    {errors.max_score && (
                                                        <p className="text-sm text-destructive mt-1">{errors.max_score}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="assessment_type">Assessment Type</Label>
                                                    <select
                                                        id="assessment_type"
                                                        value={data.assessment_type}
                                                        onChange={(e) => setData('assessment_type', e.target.value as 'quiz' | 'exam' | 'project')}
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                    >
                                                        <option value="quiz">Quiz</option>
                                                        <option value="exam">Exam</option>
                                                        <option value="project">Project</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {data.item_type === 'assignment' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Assignment Settings</h3>

                                            <div>
                                                <Label htmlFor="assignment_title">Assignment Title *</Label>
                                                <Input
                                                    id="assignment_title"
                                                    type="text"
                                                    value={data.assignment_title}
                                                    onChange={(e) => setData('assignment_title', e.target.value)}
                                                    placeholder="Enter assignment title"
                                                    className={errors.assignment_title ? 'border-destructive' : ''}
                                                />
                                                {errors.assignment_title && (
                                                    <p className="text-sm text-destructive mt-1">{errors.assignment_title}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="total_points">Total Points</Label>
                                                    <Input
                                                        id="total_points"
                                                        type="number"
                                                        value={data.total_points}
                                                        onChange={(e) => setData('total_points', e.target.value)}
                                                        placeholder="100"
                                                        className={errors.total_points ? 'border-destructive' : ''}
                                                    />
                                                    {errors.total_points && (
                                                        <p className="text-sm text-destructive mt-1">{errors.total_points}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="assignment_type">Assignment Type</Label>
                                                    <Input
                                                        id="assignment_type"
                                                        type="text"
                                                        value={data.assignment_type}
                                                        onChange={(e) => setData('assignment_type', e.target.value)}
                                                        placeholder="e.g., essay, project, homework"
                                                        className={errors.assignment_type ? 'border-destructive' : ''}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="started_at">Start Date</Label>
                                                    <Input
                                                        id="started_at"
                                                        type="datetime-local"
                                                        value={data.started_at}
                                                        onChange={(e) => setData('started_at', e.target.value)}
                                                        className={errors.started_at ? 'border-destructive' : ''}
                                                    />
                                                    {errors.started_at && (
                                                        <p className="text-sm text-destructive mt-1">{errors.started_at}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <Label htmlFor="expired_at">Due Date</Label>
                                                    <Input
                                                        id="expired_at"
                                                        type="datetime-local"
                                                        value={data.expired_at}
                                                        onChange={(e) => setData('expired_at', e.target.value)}
                                                        className={errors.expired_at ? 'border-destructive' : ''}
                                                    />
                                                    {errors.expired_at && (
                                                        <p className="text-sm text-destructive mt-1">{errors.expired_at}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Options */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h3 className="font-medium">Options</h3>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_required"
                                                checked={data.is_required}
                                                onCheckedChange={(checked) => setData('is_required', Boolean(checked))}
                                            />
                                            <Label htmlFor="is_required">
                                                This item is required for course completion
                                            </Label>
                                        </div>

                                        <div>
                                            <Label htmlFor="status">Status</Label>
                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                            >
                                                <option value="published">Published</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}`}>
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!isFormValid() || processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {getSubmitButtonText()}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {data.item_type === 'lecture' && (
                                    <>
                                        <p>• Use YouTube or Vimeo URLs for best performance</p>
                                        <p>• Duration helps with progress tracking</p>
                                        <p>• Add notes in the content section</p>
                                    </>
                                )}
                                {data.item_type === 'assessment' && (
                                    <>
                                        <p>• Set appropriate maximum scores</p>
                                        <p>• Choose the right assessment type</p>
                                        <p>• Questions can be added after creation</p>
                                    </>
                                )}
                                {data.item_type === 'assignment' && (
                                    <>
                                        <p>• Set clear due dates</p>
                                        <p>• Specify total points for grading</p>
                                        <p>• Use descriptive assignment types</p>
                                    </>
                                )}
                                {!data.item_type && (
                                    <p>Select an item type to see specific tips.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Create;
