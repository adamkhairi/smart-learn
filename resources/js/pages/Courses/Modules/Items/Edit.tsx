import { QuestionBuilder } from '@/components/question-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import AppLayout from '@/layouts/app-layout';
import { Assessment, Assignment, BreadcrumbItem, CourseModuleItemEditPageProps, Lecture, QuestionFormData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Eye, Settings, Target, BookOpen, FileQuestion, Clipboard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import InputError from '@/components/input-error';

interface ModuleItemFormData {
    title: string;
    description: string;
    item_type: 'lecture' | 'assessment' | 'assignment';
    order: number;
    is_required: boolean;
    status: 'draft' | 'published';
    video_url: string;
    duration: string;
    content_json: string;
    content_html: string;
    assessment_title: string;
    max_score: string;
    assessment_type: 'Quiz' | 'Exam';
    questions_type: 'online' | 'file';
    submission_type: 'online' | 'written';
    assignment_title: string;
    total_points: string;
    assignment_type: 'essay' | 'project';
    started_at: string;
    expired_at: string;
    assignment_content_json: string;
    assignment_content_html: string;
    assignment_instructions_json: string;
    assignment_instructions_html: string;
    assignment_rubric_json: string;
    assignment_rubric_html: string;
    assessment_content_json: string;
    assessment_content_html: string;
    assessment_instructions_json: string;
    assessment_instructions_html: string;
    questions: string; // JSON string, now always present
    [key: string]: FormDataConvertible; // Re-added with precise type
}

function Edit({ course, module, item }: CourseModuleItemEditPageProps) {
    // Helper function to get item type from polymorphic relationship
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' => {
        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';
        return 'lecture'; // Default fallback
    };

    const itemType = getItemType();

    // Initialize questions state for assessments
    const [questions, setQuestions] = useState<QuestionFormData[]>(() => {
        if (itemType === 'assessment' && item.itemable) {
            const assessment = item.itemable as Assessment;
            if (assessment.questions && assessment.questions.length > 0) {
                return assessment.questions.map((question) => ({
                    id: question.id.toString(),
                    type: question.type as 'MCQ',
                    question_text: question.question_text,
                    points: question.points,
                    choices: question.choices || undefined,
                    answer: question.answer || undefined,

                }));
            }
        }
        return [];
    });

    // Extract data from polymorphic itemable for form initialization
    const getInitialData = () => {
        const baseData = {
            title: item.title,
            description: item.description || '',
            item_type: itemType,
            order: item.order,
            is_required: item.is_required || false,
            status: (item.status as 'draft' | 'published') || 'published',
        };

        if (itemType === 'lecture' && item.itemable) {
            const lecture = item.itemable as Lecture;
            return {
                ...baseData,
                video_url: lecture.video_url || '',
                duration: lecture.duration?.toString() || '',
                content: lecture.content || '',
                content_json: lecture.content_json ? JSON.stringify(lecture.content_json) : '',
                content_html: lecture.content_html || '',
                assessment_title: '',
                max_score: '',
                assessment_type: 'Quiz' as 'Quiz' | 'Exam',
                questions_type: 'online' as 'online' | 'file',
                submission_type: 'online' as 'online' | 'written',
                assignment_title: '',
                total_points: '',
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
                questions: '[]', // Always initialize as empty array
            };
        } else if (itemType === 'assessment' && item.itemable) {
            const assessment = item.itemable as Assessment;
            console.log('Assessment data:', assessment);
            console.log('Assessment type from data:', assessment.type);
            const validAssessmentTypes = ['Quiz', 'Exam'];
            const initialAssessmentType = validAssessmentTypes.includes(assessment.type)
                ? (assessment.type as 'Quiz' | 'Exam')
                : 'Quiz'; // Default to 'Quiz' if invalid
            console.log('Initial assessment type:', initialAssessmentType);
            return {
                ...baseData,
                video_url: '',
                duration: assessment.duration?.toString() || '',
                content: '',
                content_json: '',
                content_html: '',
                assessment_title: assessment.title || '',
                max_score: assessment.max_score?.toString() || '',
                assessment_type: initialAssessmentType,
                questions_type: (assessment.questions_type as 'online' | 'file') || 'online',
                submission_type: (assessment.submission_type as 'online' | 'written') || 'online',
                assignment_title: '',
                total_points: '',
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
                assessment_content_json: assessment.content_json ? JSON.stringify(assessment.content_json) : '',
                assessment_content_html: assessment.content_html || '',
                assessment_instructions_json: assessment.instructions ? JSON.stringify(assessment.instructions) : '',
                assessment_instructions_html: '',
                questions: questions.length > 0 ? JSON.stringify(questions) : '[]', // Use existing questions if available, else empty array
            };
        } else if (itemType === 'assignment' && item.itemable) {
            const assignment = item.itemable as Assignment;
            const validAssignmentTypes = ['essay', 'project'];
            const initialAssignmentType = validAssignmentTypes.includes(assignment.assignment_type!)
                ? (assignment.assignment_type as 'essay' | 'project')
                : 'essay'; // Default to 'essay' if invalid
            return {
                ...baseData,
                video_url: '',
                duration: '',
                content: '',
                content_json: '',
                content_html: '',
                assessment_title: '',
                max_score: '',
                assessment_type: 'Quiz' as 'Quiz' | 'Exam',
                questions_type: 'online' as 'online' | 'file',
                submission_type: 'online' as 'online' | 'written',
                assignment_title: assignment.title || '',
                total_points: assignment.total_points?.toString() || '',
                assignment_type: initialAssignmentType,
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
                questions: '[]', // Always initialize as empty array
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
            assessment_type: 'Quiz' as 'Quiz' | 'Exam',
            questions_type: 'online' as 'online' | 'file',
            submission_type: 'online' as 'online' | 'written',
            assignment_title: '',
            total_points: '',
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
            questions: '[]', // Always initialize as empty array
        };
    };

    const initialData: ModuleItemFormData = getInitialData();
    console.log('Initial form data:', initialData);
    console.log('Assessment type in initial data:', initialData.assessment_type);

    const { data, setData, put, processing, errors } = useForm<ModuleItemFormData>(initialData);

    // Effect to keep questions data in sync with form data
    // This ensures `data.questions` always reflects the latest `questions` state
    useEffect(() => {
        if (itemType === 'assessment') {
            setData('questions', JSON.stringify(questions));
        }
    }, [questions, itemType, setData]);

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

        // Basic validation
        if (!data.title.trim()) {
            console.error('Title required');
            return;
        }

        if (data.item_type === 'lecture') {
            const hasVideoUrl = data.video_url && data.video_url.trim() !== '';
            const hasContent = hasRichTextContent(data.content_json);

            if (!hasVideoUrl && !hasContent) {
                console.error('Lecture requires either video URL or content');
                return;
            }
        }

        if (data.item_type === 'assessment' && !data.assessment_title) {
            console.error('Assessment title required');
            return;
        }

        if (data.item_type === 'assignment' && !data.assignment_title) {
            console.error('Assignment title required');
            return;
        }

        // Add questions for assessments
        if (itemType === 'assessment') {
            setData('questions', JSON.stringify(questions));
        }

        // Debug: Log the data being sent
        console.log('Submitting form data:', data);
        console.log('Assessment type being sent:', data.assessment_type);

        put(route('courses.modules.items.update', { course: course.id, module: module.id, item: item.id }), {
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                console.error('Form data that was sent:', data);
            }
        });
    };

    const getItemTypeIcon = () => {
        switch (itemType) {
            case 'lecture':
                return <BookOpen className="h-5 w-5" />;
            case 'assessment':
                return <FileQuestion className="h-5 w-5" />;
            case 'assignment':
                return <Clipboard className="h-5 w-5" />;
            default:
                return <BookOpen className="h-5 w-5" />; // Default icon for unknown types
            }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Item - ${module.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`/courses/${course.id}/modules/${module.id}`}>
                            <span className="mr-2">←</span> Back to Module
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Module Item {item.title}</h1>
                        <p className="text-muted-foreground">Update the details for this module item</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {getItemTypeIcon()} Item Type
                                    </CardTitle>
                                    <CardDescription>
                                        This item is a <Badge variant="secondary" className="capitalize">{itemType}</Badge>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Dynamic Form Fields */}
                                    {itemType === 'lecture' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Lecture Title</label>
                                                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Enter lecture title" required />
                                            </div>
                                            <RichTextEditor label="Lecture Description" value={data.content_json ? JSON.parse(data.content_json) : ''} onChange={(json, html) => { setData('content_json', json); setData('content_html', html); }} />
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Video URL</label>
                                                <Input value={data.video_url} onChange={e => setData('video_url', e.target.value)} placeholder="YouTube/Vimeo URL" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                                                <Input type="number" value={data.duration} onChange={e => setData('duration', e.target.value)} min={0} />
                                            </div>
                                        </div>
                                    )}
                                    {itemType === 'assessment' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Assessment Title</label>
                                                <Input value={data.assessment_title} onChange={e => setData('assessment_title', e.target.value)} placeholder="Quiz/Exam title" required />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Max Score</label>
                                                    <Input type="number" value={data.max_score} onChange={e => setData('max_score', e.target.value)} min={1} />
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
                                            <RichTextEditor label="Instructions" value={data.assessment_instructions_json ? JSON.parse(data.assessment_instructions_json) : ''} onChange={(json, html) => { setData('assessment_instructions_json', json); setData('assessment_instructions_html', html); }} />

                                            {/* Questions Builder */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Target className="h-6 w-6 text-red-500" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold">Questions</h3>
                                                        <p className="text-sm text-muted-foreground">Add and edit questions for this assessment</p>
                                                    </div>
                                                </div>
                                                <QuestionBuilder questions={questions} onChange={setQuestions} />
                                            </div>
                                        </div>
                                    )}
                                    {itemType === 'assignment' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Assignment Title</label>
                                                <Input value={data.assignment_title} onChange={e => setData('assignment_title', e.target.value)} placeholder="Assignment title" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Total Points</label>
                                                <Input type="number" value={data.total_points} onChange={e => setData('total_points', e.target.value)} min={1} />
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
                                            <RichTextEditor label="Instructions" value={data.assignment_instructions_json ? JSON.parse(data.assignment_instructions_json) : ''} onChange={(json, html) => { setData('assignment_instructions_json', json); setData('assignment_instructions_html', html); }} />
                                            <RichTextEditor label="Rubric (optional)" value={data.assignment_rubric_json ? JSON.parse(data.assignment_rubric_json) : ''} onChange={(json, html) => { setData('assignment_rubric_json', json); setData('assignment_rubric_html', html); }} />
                                        </div>
                                    )}
                                    {/* Save Button */}
                                    <div className="flex justify-end mt-8">
                                        <Button type="submit" disabled={processing} className="px-8 py-2 text-base font-semibold">
                                            {processing ? 'Saving...' : 'Update Item'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Sidebar - Enhanced with Configuration and Tips */}
                    <div className="space-y-6">
                        {/* Configuration Panel */}
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

                        {/* Item Summary */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Eye className="h-5 w-5" />
                                    Item Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Type</span>
                                    <Badge variant="outline" className="capitalize">{itemType}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Title</span>
                                    <span className="text-sm font-medium max-w-[120px] truncate" title={data.title}>
                                        {data.title}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status</span>
                                    <Badge variant={data.status === 'published' ? 'default' : 'secondary'}>
                                        {data.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Required</span>
                                    <Badge variant={data.is_required ? 'default' : 'outline'}>
                                        {data.is_required ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips for Great Items */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Tips for Great Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span>Be clear and concise in your titles and instructions</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span>For assessments, add a variety of question types</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span>Use the rich text editor for formatting and clarity</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span>Set appropriate points and durations</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Item Preview */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Item Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    Preview will appear after saving. You can view the full item from the module page.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Edit;
