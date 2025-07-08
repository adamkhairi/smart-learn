import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemEditPageProps, Lecture, Assessment, Assignment } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ArrowLeft, Save, Play, HelpCircle, ClipboardList, Eye, Trash2 } from 'lucide-react';

function Edit({ course, module, item }: CourseModuleItemEditPageProps) {
    // Helper function to get item type from polymorphic relationship
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' => {
        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';
        return 'lecture'; // Default fallback
    };

    const itemType = getItemType();

    // Extract data from polymorphic itemable for form initialization
    const getInitialData = () => {
        const baseData = {
            title: item.title,
            description: item.description || '',
            item_type: itemType,
            order: item.order,
            is_required: item.is_required || false,
            status: item.status as 'draft' | 'published' || 'published',
        };

        if (itemType === 'lecture' && item.itemable) {
            const lecture = item.itemable as Lecture;
            return {
                ...baseData,
                video_url: lecture.video_url || '',
                duration: lecture.duration?.toString() || '',
                content: lecture.content || '',
                content_json: lecture.content_json || '',
                content_html: lecture.content_html || '',
                assessment_title: '',
                max_score: '',
                assessment_type: 'quiz' as 'quiz' | 'exam' | 'project',
                questions_type: 'online' as 'online' | 'file',
                submission_type: 'online' as 'online' | 'written',
                assignment_title: '',
                total_points: '',
                assignment_type: '',
                started_at: '',
                expired_at: '',
                // Assignment content fields
                assignment_content_json: '',
                assignment_content_html: '',
                assignment_instructions_json: '',
                assignment_instructions_html: '',
                assignment_rubric_json: '',
                assignment_rubric_html: '',
                // Assessment content fields
                assessment_content_json: '',
                assessment_content_html: '',
                assessment_instructions_json: '',
                assessment_instructions_html: '',
            };
        } else if (itemType === 'assessment' && item.itemable) {
            const assessment = item.itemable as Assessment;
            return {
                ...baseData,
                video_url: '',
                duration: '',
                content: '',
                content_json: '',
                content_html: '',
                assessment_title: assessment.title || '',
                max_score: assessment.max_score?.toString() || '',
                assessment_type: assessment.type as 'quiz' | 'exam' | 'project' || 'quiz',
                questions_type: assessment.questions_type as 'online' | 'file' || 'online',
                submission_type: assessment.submission_type as 'online' | 'written' || 'online',
                assignment_title: '',
                total_points: '',
                assignment_type: '',
                started_at: '',
                expired_at: '',
                // Assignment content fields
                assignment_content_json: '',
                assignment_content_html: '',
                assignment_instructions_json: '',
                assignment_instructions_html: '',
                assignment_rubric_json: '',
                assignment_rubric_html: '',
                // Assessment content fields
                assessment_content_json: assessment.content_json ? JSON.stringify(assessment.content_json) : '',
                assessment_content_html: assessment.content_html || '',
                assessment_instructions_json: assessment.instructions ? JSON.stringify(assessment.instructions) : '',
                assessment_instructions_html: '',
            };
        } else if (itemType === 'assignment' && item.itemable) {
            const assignment = item.itemable as Assignment;
            return {
                ...baseData,
                video_url: '',
                duration: '',
                content: '',
                content_json: '',
                content_html: '',
                assessment_title: '',
                max_score: '',
                assessment_type: 'quiz' as 'quiz' | 'exam' | 'project',
                questions_type: 'online' as 'online' | 'file',
                submission_type: 'online' as 'online' | 'written',
                assignment_title: assignment.title || '',
                total_points: assignment.total_points?.toString() || '',
                assignment_type: assignment.assignment_type || '',
                started_at: assignment.started_at ? assignment.started_at.slice(0, 16) : '',
                expired_at: assignment.expired_at ? assignment.expired_at.slice(0, 16) : '',
                // Assignment content fields
                assignment_content_json: assignment.content_json ? JSON.stringify(assignment.content_json) : '',
                assignment_content_html: assignment.content_html || '',
                assignment_instructions_json: assignment.instructions ? JSON.stringify(assignment.instructions) : '',
                assignment_instructions_html: '',
                assignment_rubric_json: assignment.rubric ? JSON.stringify(assignment.rubric) : '',
                assignment_rubric_html: '',
                // Assessment content fields
                assessment_content_json: '',
                assessment_content_html: '',
                assessment_instructions_json: '',
                assessment_instructions_html: '',
            };
        }

        // Fallback
        return {
            ...baseData,
            video_url: '',
            duration: '',
            content: '',
            content_json: '',
            content_html: '',
            assessment_title: '',
            max_score: '',
            assessment_type: 'quiz' as 'quiz' | 'exam' | 'project',
            questions_type: 'online' as 'online' | 'file',
            submission_type: 'online' as 'online' | 'written',
            assignment_title: '',
            total_points: '',
            assignment_type: '',
            started_at: '',
            expired_at: '',
            // Assignment content fields
            assignment_content_json: '',
            assignment_content_html: '',
            assignment_instructions_json: '',
            assignment_instructions_html: '',
            assignment_rubric_json: '',
            assignment_rubric_html: '',
            // Assessment content fields
            assessment_content_json: '',
            assessment_content_html: '',
            assessment_instructions_json: '',
            assessment_instructions_html: '',
        };
    };

    const { data, setData, put, processing, errors } = useForm(getInitialData());

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

        // Type-specific validation
        if (data.item_type === 'lecture' && !data.video_url && !data.content) {
            console.error('Either video URL or content required for lecture');
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
                console.log('Module item updated successfully');
            },
            onError: (errors: Record<string, string>) => {
                console.error('Form submission errors:', errors);
            }
        };

        put(`/courses/${course.id}/modules/${module.id}/items/${item.id}`, options);
    };



    // Validation helper
    const isFormValid = () => {
        if (!data.title.trim() || !data.item_type) return false;

        switch (data.item_type) {
            case 'lecture':
                return data.video_url.trim() || data.content.trim();
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
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Edit Item</h1>
                        <p className="text-muted-foreground">
                            Update "{item.title}" in {module.title}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Item
                            </Link>
                        </Button>
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
                                    {/* Item Type Selection (Read-only for editing) */}
                                    <div className="space-y-3">
                                        <Label>Item Type</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {itemTypes.map((type) => (
                                                <div
                                                    key={type.value}
                                                    className={`border rounded-lg p-4 ${
                                                        itemType === type.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border opacity-50'
                                                    }`}
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
                                        <p className="text-sm text-muted-foreground">
                                            Note: Item type cannot be changed after creation.
                                        </p>
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
                                                <Label htmlFor="video_url">Video URL (optional)</Label>
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
                                                <RichTextEditor
                                                    id="content"
                                                    label="Lecture Content"
                                                    value={data.content_json || data.content}
                                                    onChange={(jsonContent, htmlContent) => {
                                                        setData('content_json', jsonContent);
                                                        setData('content_html', htmlContent);
                                                    }}
                                                    error={errors.content}
                                                />
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

                                            {/* Assessment Content */}
                                            <div>
                                                <RichTextEditor
                                                    id="assessment_content"
                                                    label="Assessment Content"
                                                    value={data.assessment_content_json}
                                                    onChange={(json, html) => {
                                                        setData('assessment_content_json', json);
                                                        setData('assessment_content_html', html);
                                                    }}
                                                    error={errors.assessment_content_json}
                                                />
                                            </div>

                                            {/* Assessment Instructions */}
                                            <div>
                                                <RichTextEditor
                                                    id="assessment_instructions"
                                                    label="Instructions"
                                                    value={data.assessment_instructions_json}
                                                    onChange={(json, html) => {
                                                        setData('assessment_instructions_json', json);
                                                        setData('assessment_instructions_html', html);
                                                    }}
                                                    error={errors.assessment_instructions_json}
                                                />
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

                                            {/* Assignment Content */}
                                            <div>
                                                <RichTextEditor
                                                    id="assignment_content"
                                                    label="Assignment Content"
                                                    value={data.assignment_content_json}
                                                    onChange={(json, html) => {
                                                        setData('assignment_content_json', json);
                                                        setData('assignment_content_html', html);
                                                    }}
                                                    error={errors.assignment_content_json}
                                                />
                                            </div>

                                            {/* Assignment Instructions */}
                                            <div>
                                                <RichTextEditor
                                                    id="assignment_instructions"
                                                    label="Instructions"
                                                    value={data.assignment_instructions_json}
                                                    onChange={(json, html) => {
                                                        setData('assignment_instructions_json', json);
                                                        setData('assignment_instructions_html', html);
                                                    }}
                                                    error={errors.assignment_instructions_json}
                                                />
                                            </div>

                                            {/* Assignment Rubric */}
                                            <div>
                                                <RichTextEditor
                                                    id="assignment_rubric"
                                                    label="Grading Rubric"
                                                    value={data.assignment_rubric_json}
                                                    onChange={(json, html) => {
                                                        setData('assignment_rubric_json', json);
                                                        setData('assignment_rubric_html', html);
                                                    }}
                                                    error={errors.assignment_rubric_json}
                                                />
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

                                        <div>
                                            <Label htmlFor="order">Order</Label>
                                            <Input
                                                id="order"
                                                type="number"
                                                min="1"
                                                value={data.order}
                                                onChange={(e) => setData('order', parseInt(e.target.value) || 1)}
                                                className={errors.order ? 'border-destructive' : ''}
                                            />
                                            {errors.order && (
                                                <p className="text-sm text-destructive mt-1">{errors.order}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                Cancel
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!isFormValid() || processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Updating...' : 'Update Item'}
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
                                <CardTitle className="text-lg">Current Item</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Type:</span>
                                    <span className="capitalize">{itemType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Required:</span>
                                    <span>{data.is_required ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="capitalize">{data.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Order:</span>
                                    <span>#{data.order}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Item
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full text-destructive" asChild>
                                    <Link
                                        href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}
                                        method="delete"
                                        as="button"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Item
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
