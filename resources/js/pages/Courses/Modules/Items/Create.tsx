import { QuestionBuilder } from '@/components/question-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle, FileText, GraduationCap, Play, Settings, Users, ClipboardList, Target, AlertCircle } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleItemCreatePageProps, QuestionFormData } from '@/types';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

function Create({ course, module, nextOrder }: CourseModuleItemCreatePageProps) {
    const [selectedType, setSelectedType] = useState<'lecture' | 'assessment' | 'assignment' | ''>('');
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [activeStep, setActiveStep] = useState<'type' | 'details' | 'content'>('type');

    // Initialize flash toast notifications
    const { loading: showLoading, dismiss: dismissToast } = useToast();

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
        assessment_type: 'Quiz' as 'Quiz' | 'Exam',
        assignment_title: '',
        total_points: 100,
        assignment_type: 'essay' as 'essay' | 'project',
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
                // Backend will provide flash message, no need for manual toast
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
                assignment_type: 'essay' as 'essay' | 'project',
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
                assessment_title: data.title, // Auto-populate from generic title
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
                assignment_type: 'essay' as 'essay' | 'project',
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
                assignment_title: data.title, // Auto-populate from generic title
                total_points: 100,
                assignment_type: 'essay' as 'essay' | 'project',
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

        // Move to next step
        setActiveStep('details');
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

            <div className="flex h-full flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Module
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Add Module Item</h1>
                        <p className="text-muted-foreground">Add content to "{module.title}"</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 ${activeStep === 'type' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${activeStep === 'type' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                1
                            </div>
                            <span className="text-sm font-medium">Choose Type</span>
                        </div>
                        <div className="h-px w-8 bg-border" />
                        <div className={`flex items-center space-x-2 ${activeStep === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${activeStep === 'details' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                2
                            </div>
                            <span className="text-sm font-medium">Basic Details</span>
                        </div>
                        <div className="h-px w-8 bg-border" />
                        <div className={`flex items-center space-x-2 ${activeStep === 'content' ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${activeStep === 'content' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                3
                            </div>
                            <span className="text-sm font-medium">Content</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Item Type Selection */}
                            {activeStep === 'type' && (
                                <Card className="border-2 border-dashed border-primary/20">
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">Choose Item Type</CardTitle>
                                        <CardDescription>Select the type of content you want to add to this module</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            {itemTypes.map((type) => (
                                                <div
                                                    key={type.value}
                                                    className={`group cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg ${
                                                        selectedType === type.value
                                                            ? 'border-primary bg-primary/5 shadow-lg'
                                                            : 'border-border hover:border-primary/30'
                                                    } ${
                                                        errors.item_type ? 'border-destructive' : ''
                                                    }`}
                                                    onClick={() => handleTypeChange(type.value as 'lecture' | 'assessment' | 'assignment')}
                                                >
                                                    <div className="flex flex-col items-center text-center space-y-4">
                                                        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${type.bgColor} ${type.iconColor}`}>
                                                            {type.icon}
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-semibold">{type.label}</div>
                                                            <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {type.features.map((feature, idx) => (
                                                                <div key={idx} className="flex items-center gap-1">
                                                                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                                                                    {feature}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={errors.item_type} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Basic Details */}
                            {activeStep === 'details' && selectedType && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            {getTypeIcon(selectedType)}
                                            <div>
                                                <CardTitle>Basic Details</CardTitle>
                                                <CardDescription>Configure the basic information for your {selectedType}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label htmlFor="title" className="text-base font-medium">Title *</Label>
                                                <Input
                                                    id="title"
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) => {
                                                        const newTitle = e.target.value;
                                                        setData({
                                                            ...data,
                                                            title: newTitle,
                                                            // Auto-populate type-specific titles
                                                            assessment_title: selectedType === 'assessment' ? newTitle : data.assessment_title,
                                                            assignment_title: selectedType === 'assignment' ? newTitle : data.assignment_title
                                                        });
                                                    }}
                                                    placeholder={`e.g., ${getPlaceholderTitle(selectedType)}`}
                                                    className={`mt-2 h-12 text-base ${errors.title ? 'border-destructive' : ''}`}
                                                />
                                                <InputError message={errors.title} />
                                            </div>
                                            <div>
                                                <Label htmlFor="description" className="text-base font-medium">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Briefly describe this module item..."
                                                    className={`mt-2 ${errors.description ? 'border-destructive' : ''}`}
                                                    rows={3}
                                                />
                                                <InputError message={errors.description} />
                                            </div>
                                        </div>

                                         {/* Type-specific basic fields */}
                                         {selectedType === 'assessment' && (
                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="max_score" className="text-base font-medium">Maximum Score</Label>
                                                    <Input
                                                        id="max_score"
                                                        type="number"
                                                        value={data.max_score}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            setData('max_score', parseInt(e.target.value, 10))
                                                        }
                                                        placeholder="100"
                                                        className={`mt-2 h-12 text-base ${errors.max_score ? 'border-destructive' : ''}`}
                                                    />
                                                    <InputError message={errors.max_score} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="assessment_type" className="text-base font-medium">Assessment Type</Label>
                                                    <Select
                                                        value={data.assessment_type}
                                                        onValueChange={(value) => setData('assessment_type', value as 'Quiz' | 'Exam')}
                                                    >
                                                        <SelectTrigger id="assessment_type" className="mt-2 h-12 text-base">
                                                            <SelectValue placeholder="Select assessment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Quiz">Quiz</SelectItem>
                                                            <SelectItem value="Exam">Exam</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.assessment_type} />
                                                </div>
                                            </div>
                                        )}

                                         {selectedType === 'assignment' && (
                                             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="total_points" className="text-base font-medium">Total Points</Label>
                                                    <Input
                                                        id="total_points"
                                                        type="number"
                                                        value={data.total_points}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                            setData('total_points', parseInt(e.target.value, 10))
                                                        }
                                                        placeholder="100"
                                                        className={`mt-2 h-12 text-base ${errors.total_points ? 'border-destructive' : ''}`}
                                                    />
                                                    <InputError message={errors.total_points} />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="assignment_type" className="text-base font-medium">Assignment Type</Label>
                                                    <Select
                                                        value={data.assignment_type}
                                                        onValueChange={(value) => setData('assignment_type', value as 'essay' | 'project')}
                                                    >
                                                        <SelectTrigger id="assignment_type" className="mt-2 h-12 text-base">
                                                            <SelectValue placeholder="Select assignment type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="essay">Essay</SelectItem>
                                                            <SelectItem value="project">Project</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.assignment_type} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => setActiveStep('content')}
                                                disabled={!data.title.trim()}
                                                className="px-8"
                                            >
                                                Continue to Content
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 3: Content Configuration */}
                            {activeStep === 'content' && selectedType && (
                                <div className="space-y-6">
                                    {selectedType === 'lecture' && (
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <Play className="h-6 w-6 text-blue-500" />
                                                    <div>
                                                        <CardTitle>Lecture Content</CardTitle>
                                                        <CardDescription>Add video content and supplementary materials</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <Label htmlFor="video_url" className="text-base font-medium">Video URL (optional)</Label>
                                                        <Input
                                                            id="video_url"
                                                            type="url"
                                                            value={data.video_url}
                                                            onChange={(e) => setData('video_url', e.target.value)}
                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                            className={`mt-2 h-12 text-base ${errors.video_url ? 'border-destructive' : ''}`}
                                                        />
                                                        <InputError message={errors.video_url} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="duration" className="text-base font-medium">Duration (minutes)</Label>
                                                        <Input
                                                            id="duration"
                                                            type="number"
                                                            value={data.duration}
                                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('duration', parseInt(e.target.value, 10))}
                                                            placeholder="e.g., 300 for 5 minutes"
                                                            className={`mt-2 h-12 text-base ${errors.duration ? 'border-destructive' : ''}`}
                                                        />
                                                        <InputError message={errors.duration} />
                                                    </div>
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
                                            </CardContent>
                                        </Card>
                                    )}

                                    {selectedType === 'assessment' && (
                                        <div className="space-y-6">
                                            {/* Assessment Content */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="h-6 w-6 text-orange-500" />
                                                        <div>
                                                            <CardTitle>Assessment Content</CardTitle>
                                                            <CardDescription>Add description and instructions for the assessment</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div>
                                                        <RichTextEditor
                                                            id="assessment_content"
                                                            label="Assessment Description"
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
                                                </CardContent>
                                            </Card>

                                            {/* Questions Builder */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Target className="h-6 w-6 text-red-500" />
                                                            <div>
                                                                <CardTitle>Questions</CardTitle>
                                                                <CardDescription>Add questions to your assessment</CardDescription>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">{questions.length} questions</Badge>
                                                            <Badge variant="outline">{questions.reduce((sum, q) => sum + q.points, 0)} total points</Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    {questions.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                            <h3 className="text-lg font-semibold mb-2">No Questions Added</h3>
                                                            <p className="text-muted-foreground mb-4">Start building your assessment by adding questions below.</p>
                                                        </div>
                                                    ) : null}
                                                    <QuestionBuilder questions={questions} onChange={setQuestions} />
                                                    <InputError message={errors.questions} />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {selectedType === 'assignment' && (
                                        <div className="space-y-6">
                                            {/* Assignment Dates */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <Settings className="h-6 w-6 text-green-500" />
                                                        <div>
                                                            <CardTitle>Assignment Schedule</CardTitle>
                                                            <CardDescription>Set the availability and due dates</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div>
                                                            <Label htmlFor="started_at" className="text-base font-medium">Start Date *</Label>
                                                            <div className="mt-2">
                                                                <DateTimePicker
                                                                    id="started_at"
                                                                    value={data.started_at}
                                                                    onChange={(value) => setData('started_at', value)}
                                                                    placeholder="Pick start date and time"
                                                                    className={errors.started_at ? 'border-destructive' : ''}
                                                                />
                                                            </div>
                                                            <InputError message={errors.started_at} />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="expired_at" className="text-base font-medium">Due Date *</Label>
                                                            <div className="mt-2">
                                                                <DateTimePicker
                                                                    id="expired_at"
                                                                    value={data.expired_at}
                                                                    onChange={(value) => setData('expired_at', value)}
                                                                    placeholder="Pick due date and time"
                                                                    className={errors.expired_at ? 'border-destructive' : ''}
                                                                />
                                                            </div>
                                                            <InputError message={errors.expired_at} />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Assignment Content */}
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-6 w-6 text-blue-500" />
                                                        <div>
                                                            <CardTitle>Assignment Content</CardTitle>
                                                            <CardDescription>Describe the assignment requirements</CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div>
                                                        <RichTextEditor
                                                            id="assignment_content"
                                                            label="Assignment Description"
                                                            value={data.assignment_content_json}
                                                            onChange={(json, html) => {
                                                                setData('assignment_content_json', json);
                                                                setData('assignment_content_html', html);
                                                            }}
                                                            error={errors.assignment_content_json}
                                                        />
                                                    </div>
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
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex items-center justify-between pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveStep('details')}
                                        >
                                            Back to Details
                                        </Button>
                                        <Button type="submit" disabled={processing} className="px-8">
                                            {getSubmitButtonText()}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Configuration Panel - Moved to top and made more compact */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Settings className="h-5 w-5" />
                                        Quick Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_required"
                                            checked={data.is_required}
                                            onCheckedChange={(checked) => setData('is_required', checked === true)}
                                        />
                                        <Label htmlFor="is_required" className="text-sm">Required for completion</Label>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">Publishing Status</Label>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={data.status === 'published' ? 'default' : 'outline'}
                                                onClick={() => setData('status', 'published')}
                                                className="flex-1 text-xs"
                                            >
                                                Published
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={data.status === 'draft' ? 'default' : 'outline'}
                                                onClick={() => setData('status', 'draft')}
                                                className="flex-1 text-xs"
                                            >
                                                Draft
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Summary - Enhanced */}
                            {selectedType && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <AlertCircle className="h-5 w-5" />
                                            Progress Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Type Selected</span>
                                            <Badge variant="outline" className="capitalize">{selectedType}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Title</span>
                                            <span className="text-sm font-medium max-w-[120px] truncate" title={data.title || 'Not set'}>
                                                {data.title || 'Not set'}
                                            </span>
                                        </div>
                                        {selectedType === 'assessment' && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Questions</span>
                                                    <Badge variant="outline">{questions.length}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Total Points</span>
                                                    <Badge variant="outline">{questions.reduce((sum, q) => sum + q.points, 0)}</Badge>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Status</span>
                                            <Badge variant={data.status === 'published' ? 'default' : 'secondary'}>
                                                {data.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help & Tips */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Tips & Guidelines</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span>Be clear and concise in your titles and descriptions</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span>For assessments, add a variety of question types</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span>Use rich text formatting for better readability</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                            <span>Set appropriate points and time limits</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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
        icon: <Play className="h-6 w-6" />,
        description: 'Video content and materials',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        features: ['Video content', 'Rich text editor', 'Duration tracking', 'Progress tracking']
    },
    {
        value: 'assessment',
        label: 'Assessment',
        icon: <Target className="h-6 w-6" />,
        description: 'Quizzes, exams, and tests',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        features: ['Multiple question types', 'Auto-grading', 'Score tracking', 'Results display']
    },
    {
        value: 'assignment',
        label: 'Assignment',
        icon: <ClipboardList className="h-6 w-6" />,
        description: 'Homework and projects',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        features: ['File submissions', 'Due dates', 'Manual grading', 'Rubrics']
    },
];

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'lecture':
            return <Play className="h-6 w-6 text-blue-500" />;
        case 'assessment':
            return <Target className="h-6 w-6 text-orange-500" />;
        case 'assignment':
            return <ClipboardList className="h-6 w-6 text-green-500" />;
        default:
            return <FileText className="h-6 w-6" />;
    }
};

const getPlaceholderTitle = (type: string) => {
    switch (type) {
        case 'lecture':
            return 'Introduction to Algebra';
        case 'assessment':
            return 'Chapter 1 Quiz';
        case 'assignment':
            return 'Research Paper';
        default:
            return 'Module Item';
    }
};

export default Create;
