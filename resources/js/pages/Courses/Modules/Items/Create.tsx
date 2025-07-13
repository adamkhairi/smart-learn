import { QuestionBuilder } from '@/components/question-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemCreatePageProps, QuestionFormData } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, HelpCircle, Play } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import InputError from '@/components/input-error';

function Create({ course, module, nextOrder }: CourseModuleItemCreatePageProps) {
    const [selectedType, setSelectedType] = useState<'lecture' | 'assessment' | 'assignment' | ''>('');
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);

    // Initialize flash toast notifications
    const { success: showSuccess, loading: showLoading, dismiss: dismissToast } = useToast();

    const { data, setData, processing, errors, setError, clearErrors } = useForm({
        title: '',
        description: '',
        item_type: '' as 'lecture' | 'assessment' | 'assignment',
        order: nextOrder,
        is_required: false as boolean,
        status: 'published' as 'draft' | 'published',
        video_url: '',
        duration: 0,
        content_json: '',
        content_html: '',
        assessment_title: '',
        max_score: 100,
        assessment_type: 'Quiz' as 'Quiz' | 'Exam' | 'Project',
        assignment_title: '',
        total_points: 100,
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
        // Questions field for assessments
        questions: '[]',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: 'Add Item', href: '#' },
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Basic validation
        if (!data.title.trim()) {
            setError('title', 'Please enter a title for the module item.');
            return;
        }

        if (!selectedType) {
            setError('item_type', 'Please select an item type (lecture, assessment, or assignment).');
            return;
        }

        // Helper function to check if rich text editor has actual content
        const hasRichTextContent = (jsonContent: string): boolean => {
            if (!jsonContent) return false;

            try {
                const parsed = JSON.parse(jsonContent);
                if (parsed && parsed.root && parsed.root.children) {
                    return parsed.root.children.some(
                        (child: { children?: { text?: string }[] }) =>
                            child.children && child.children.some((textNode: { text?: string }) => textNode.text && textNode.text.trim() !== ''),
                    );
                }
                return false;
            } catch {
                return false;
            }
        };

        // Type-specific validation
        if (selectedType === 'lecture') {
            const hasVideoUrl = data.video_url && data.video_url.trim() !== '';
            const hasContent = hasRichTextContent(data.content_json);

            if (!hasVideoUrl && !hasContent) {
                setError('video_url', 'Please provide either a video URL or content for the lecture.');
                setError('content_json', 'Please provide either a video URL or content for the lecture.');
                return;
            }
        }

        if (selectedType === 'assessment') {
            if (!data.assessment_title.trim()) {
                setError('assessment_title', 'Please enter a title for the assessment.');
                return;
            }
            if (questions.length === 0) {
                // Show error in the questions section
                setError('questions', 'Please add at least one question to the assessment.');
                return;
            }
        }

        if (selectedType === 'assignment') {
            if (!data.assignment_title.trim()) {
                setError('assignment_title', 'Please enter a title for the assignment.');
                return;
            }
            if (!data.started_at) {
                setError('started_at', 'Please set a start date for the assignment.');
                return;
            }
            if (!data.expired_at) {
                setError('expired_at', 'Please set a due date for the assignment.');
                return;
            }
        }

        // Show loading notification and store the toast ID
        const loadingToastId = showLoading('Adding module item...');

        // Create submission data with questions if this is an assessment
        const submitData = { ...data }; // Start with a copy of the current form data

        if (selectedType === 'assessment') {
            submitData.questions = JSON.stringify(questions);
        }

        // Use the manual URL for now until we debug the route issue
        router.post(`/courses/${course.id}/modules/${module.id}/items`, submitData, {
            onSuccess: () => {
                // Dismiss the loading toast
                dismissToast(loadingToastId);
                showSuccess('Module item added successfully!');
            },
            onError: (formErrors) => {
                // Dismiss the loading toast
                dismissToast(loadingToastId);
                console.error('Submission errors:', formErrors);

                // Debug: Log the errors object to see what we're getting
                console.log('Current errors object:', errors);
                console.log('Form errors received:', formErrors);

                // Inertia.js will automatically set the errors in the form
                // But let's also manually set them to ensure they show up
                Object.entries(formErrors).forEach(([field, message]) => {
                    if (typeof message === 'string') {
                        setError(field as keyof typeof data, message);
                    } else if (Array.isArray(message)) {
                        setError(field as keyof typeof data, message[0]);
                    }
                });
            },
        });
    };

    const handleTypeChange = (type: 'lecture' | 'assessment' | 'assignment') => {
        setSelectedType(type);

        // Clear errors when changing type
        clearErrors();

        // Set the item type first
        setData('item_type', type);

        // Clear type-specific fields based on the selected type
        if (type === 'lecture') {
            setData({
                ...data,
                item_type: type,
                video_url: '',
                duration: 0,
                content_json: '',
                content_html: '',
                // Clear other type fields
                assessment_title: '',
                max_score: 100,
                assessment_type: 'Quiz',
                assessment_content_json: '',
                assessment_content_html: '',
                assessment_instructions_json: '',
                assessment_instructions_html: '',
                assignment_title: '',
                total_points: 100,
                assignment_type: '',
                started_at: '',
                expired_at: '',
                assignment_content_json: '',
                assignment_content_html: '',
                assignment_instructions_json: '',
                assignment_instructions_html: '',
                assignment_rubric_json: '',
                assignment_rubric_html: '',
                questions: '[]', // Ensure questions is an empty JSON array string
            });
        } else if (type === 'assessment') {
            setData({
                ...data,
                item_type: type,
                assessment_title: '',
                max_score: 100,
                assessment_type: 'Quiz',
                assessment_content_json: '',
                assessment_content_html: '',
                assessment_instructions_json: '',
                assessment_instructions_html: '',
                // Clear other type fields
                video_url: '',
                duration: 0,
                content_json: '',
                content_html: '',
                assignment_title: '',
                total_points: 100,
                assignment_type: '',
                started_at: '',
                expired_at: '',
                assignment_content_json: '',
                assignment_content_html: '',
                assignment_instructions_json: '',
                assignment_instructions_html: '',
                assignment_rubric_json: '',
                assignment_rubric_html: '',
                questions: '[]', // Ensure questions is an empty JSON array string
            });
        } else if (type === 'assignment') {
            setData({
                ...data,
                item_type: type,
                assignment_title: '',
                total_points: 100,
                assignment_type: '',
                started_at: '',
                expired_at: '',
                assignment_content_json: '',
                assignment_content_html: '',
                assignment_instructions_json: '',
                assignment_instructions_html: '',
                assignment_rubric_json: '',
                assignment_rubric_html: '',
                // Clear other type fields
                video_url: '',
                duration: 0,
                content_json: '',
                content_html: '',
                assessment_title: '',
                max_score: 100,
                assessment_type: 'Quiz',
                assessment_content_json: '',
                assessment_content_html: '',
                assessment_instructions_json: '',
                assessment_instructions_html: '',
            });
        }

        // Clear questions for assessments
        setQuestions([]);
    };

    const getSubmitButtonText = () => {
        if (processing) {
            return 'Adding...';
        }
        return 'Add Item';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add Item - ${module.title}`} />

            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Module
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Module Item</h1>
                        <p className="text-muted-foreground">Add content to "{module.title}"</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Details</CardTitle>
                                <CardDescription>Configure your new module item</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Item Type *</Label>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                            {itemTypes.map((type) => (
                                                <div
                                                    key={type.value}
                                                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                                        selectedType === type.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                    } ${
                                                        errors.item_type ? 'border-destructive' : ''
                                                    }`}
                                                    onClick={() => handleTypeChange(type.value as 'lecture' | 'assessment' | 'assignment')}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={type.color}>{type.icon}</div>
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-sm text-muted-foreground">{type.description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={errors.item_type} />
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="e.g., Introduction to Algebra"
                                                className={`mt-1 ${errors.title ? 'border-destructive' : ''}`}
                                            />
                                            <InputError message={errors.title} />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Briefly describe this module item..."
                                                className={`mt-1 ${errors.description ? 'border-destructive' : ''}`}
                                            />
                                            <InputError message={errors.description} />
                                        </div>
                                    </div>

                                    {selectedType === 'lecture' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Lecture Content</h3>
                                            <div>
                                                <Label htmlFor="video_url">Video URL (optional)</Label>
                                                <Input
                                                    id="video_url"
                                                    type="url"
                                                    value={data.video_url}
                                                    onChange={(e) => setData('video_url', e.target.value)}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className={errors.video_url ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.video_url} />
                                            </div>
                                            <div>
                                                <Label htmlFor="duration">Duration (minutes)</Label>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    value={data.duration}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData('duration', parseInt(e.target.value, 10))}
                                                    placeholder="e.g., 300 for 5 minutes"
                                                    className={errors.duration ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.duration} />
                                            </div>
                                            <div>
                                                <RichTextEditor
                                                    id="content"
                                                    label="Lecture Content"
                                                    value={data.content_json}
                                                    onChange={(json, html) => {
                                                        setData('content_json', json);
                                                        setData('content_html', html);
                                                    }}
                                                    error={errors.content_json}
                                                    minLength={10}
                                                    maxLength={10000}
                                                    showWordCount
                                                    showContentQuality
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedType === 'assessment' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Assessment Settings</h3>
                                            <div>
                                                <Label htmlFor="assessment_title">Assessment Title *</Label>
                                                <Input
                                                    id="assessment_title"
                                                    type="text"
                                                    value={data.assessment_title}
                                                    onChange={(e) => setData('assessment_title', e.target.value)}
                                                    placeholder="e.g., Chapter 1 Quiz"
                                                    className={errors.assessment_title ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.assessment_title} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="max_score">Maximum Score</Label>
                                                    <Input
                                                        id="max_score"
                                                        type="number"
                                                        value={data.max_score}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            setData('max_score', parseInt(e.target.value, 10))
                                                        }
                                                        placeholder="100"
                                                        className={errors.max_score ? 'border-destructive' : ''}
                                                    />
                                                    <InputError message={errors.max_score} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="assessment_type">Assessment Type</Label>
                                                    <select
                                                        id="assessment_type"
                                                        value={data.assessment_type}
                                                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                                            setData('assessment_type', e.target.value as 'Quiz' | 'Exam' | 'Project')
                                                        }
                                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${errors.assessment_type ? 'border-destructive' : ''}`}
                                                    >
                                                        <option value="Quiz">Quiz</option>
                                                        <option value="Exam">Exam</option>
                                                        <option value="Project">Project</option>
                                                    </select>
                                                    <InputError message={errors.assessment_type} />
                                                </div>
                                            </div>
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

                                            {/* Questions Builder */}
                                            <div className="border-t pt-4">
                                                <QuestionBuilder questions={questions} onChange={setQuestions} />
                                                <InputError message={errors.questions} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedType === 'assignment' && (
                                        <div className="space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Assignment Settings</h3>
                                            <div>
                                                <Label htmlFor="assignment_title">Assignment Title *</Label>
                                                <Input
                                                    id="assignment_title"
                                                    type="text"
                                                    value={data.assignment_title}
                                                    onChange={(e) => setData('assignment_title', e.target.value)}
                                                    placeholder="e.g., Research Paper"
                                                    className={errors.assignment_title ? 'border-destructive' : ''}
                                                />
                                                <InputError message={errors.assignment_title} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="total_points">Total Points</Label>
                                                    <Input
                                                        id="total_points"
                                                        type="number"
                                                        value={data.total_points}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            setData('total_points', parseInt(e.target.value, 10))
                                                        }
                                                        placeholder="100"
                                                        className={errors.total_points ? 'border-destructive' : ''}
                                                    />
                                                    <InputError message={errors.total_points} />
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
                                                    <InputError message={errors.assignment_type} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="started_at">Start Date *</Label>
                                                    <Input
                                                        id="started_at"
                                                        type="datetime-local"
                                                        value={data.started_at}
                                                        onChange={(e) => setData('started_at', e.target.value)}
                                                        className={errors.started_at ? 'border-destructive' : ''}
                                                    />
                                                    <InputError message={errors.started_at} />
                                                </div>
                                                <div>
                                                    <Label htmlFor="expired_at">Due Date *</Label>
                                                    <Input
                                                        id="expired_at"
                                                        type="datetime-local"
                                                        value={data.expired_at}
                                                        onChange={(e) => setData('expired_at', e.target.value)}
                                                        className={errors.expired_at ? 'border-destructive' : ''}
                                                    />
                                                    <InputError message={errors.expired_at} />
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

                                    <div className="flex items-center justify-end gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {getSubmitButtonText()}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_required"
                                        checked={data.is_required}
                                        onCheckedChange={(checked) => setData('is_required', checked === true)}
                                    />
                                    <Label htmlFor="is_required">Required</Label>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={data.status === 'published' ? 'default' : 'secondary'}
                                            onClick={() => setData('status', 'published')}
                                        >
                                            Published
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={data.status === 'draft' ? 'default' : 'secondary'}
                                            onClick={() => setData('status', 'draft')}
                                        >
                                            Draft
                                        </Button>
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

const itemTypes = [
    {
        value: 'lecture',
        label: 'Lecture',
        icon: <Play className="h-4 w-4" />,
        description: 'Video content',
        color: 'text-blue-500',
    },
    {
        value: 'assessment',
        label: 'Assessment',
        icon: <HelpCircle className="h-4 w-4" />,
        description: 'Quiz, exam, etc.',
        color: 'text-orange-500',
    },
    {
        value: 'assignment',
        label: 'Assignment',
        icon: <ClipboardList className="h-4 w-4" />,
        description: 'Homework, projects',
        color: 'text-red-500',
    },
];

export default Create;
