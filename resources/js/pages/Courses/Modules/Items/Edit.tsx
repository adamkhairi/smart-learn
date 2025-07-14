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
import { Eye, Settings, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface EditFormDataType {
    title: string;
    description: string | null;
    item_type: 'lecture' | 'assessment' | 'assignment';
    order: number;
    is_required: boolean;
    status: 'draft' | 'published';
    video_url: string | null;
    duration: number | null;
    content: string | null; // Old content field
    content_json: string | null;
    content_html: string | null;
    assessment_title: string | null;
    max_score: number | null;
    assessment_type: 'Quiz' | 'Exam' | 'Project';
    questions_type: 'online' | 'file';
    submission_type: 'online' | 'written';
    assignment_title: string | null;
    total_points: number | null;
    assignment_type: string | null;
    started_at: string | null;
    expired_at: string | null;
    assignment_content_json: string | null;
    assignment_content_html: string | null;
    assignment_instructions_json: string | null;
    assignment_instructions_html: string | null;
    assignment_rubric_json: string | null;
    assignment_rubric_html: string | null;
    assessment_content_json: string | null;
    assessment_content_html: string | null;
    assessment_instructions_json: string | null;
    assessment_instructions_html: string | null;
    questions: string; // JSON string of questions array
    [key: string]: string | number | boolean | File | Blob | null | undefined;
}

function Edit({ course, module, item }: CourseModuleItemEditPageProps) {
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' => {
        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';
        return 'lecture'; // Default fallback
    };

    const itemType = getItemType();

    const [questions, setQuestions] = useState<QuestionFormData[]>(() => {
        if (itemType === 'assessment' && item.itemable) {
            const assessment = item.itemable as Assessment;
            if (assessment.questions && assessment.questions.length > 0) {
                return assessment.questions.map((question) => ({
                    id: question.id.toString(),
                    type: question.type as 'MCQ' | 'Essay',
                    question_text: question.question_text,
                    points: question.points,
                    choices: question.choices || undefined,
                    answer: question.answer || undefined,
                    keywords: question.keywords || undefined,
                }));
            }
        }
        return [];
    });

    const getInitialFormState = (): EditFormDataType => {
        const baseState = {
            title: item.title,
            description: item.description || null,
            item_type: itemType,
            order: item.order,
            is_required: item.is_required || false,
            status: (item.status as 'draft' | 'published') || 'published',
            video_url: null,
            duration: null,
            content: null,
            content_json: null,
            content_html: null,
            assessment_title: null,
            max_score: null,
            assessment_type: 'Quiz' as 'Quiz' | 'Exam' | 'Project',
            questions_type: 'online' as 'online' | 'file',
            submission_type: 'online' as 'online' | 'written',
            assignment_title: null,
            total_points: null,
            assignment_type: null,
            started_at: null,
            expired_at: null,
            assignment_content_json: null,
            assignment_content_html: null,
            assignment_instructions_json: null,
            assignment_instructions_html: null,
            assignment_rubric_json: null,
            assignment_rubric_html: null,
            assessment_content_json: null,
            assessment_content_html: null,
            assessment_instructions_json: null,
            assessment_instructions_html: null,
            questions: '[]',
        };

        if (item.itemable) {
            if (itemType === 'lecture') {
                const lecture = item.itemable as Lecture;
                return {
                    ...baseState,
                    video_url: lecture.video_url || null,
                    duration: lecture.duration || null,
                    content: lecture.content || null,
                    content_json: lecture.content_json ? JSON.stringify(lecture.content_json) : null,
                    content_html: lecture.content_html || null,
                };
            } else if (itemType === 'assessment') {
                const assessment = item.itemable as Assessment;
                const validAssessmentTypes = ['Quiz', 'Exam', 'Project'];
                const initialAssessmentType = validAssessmentTypes.includes(assessment.type)
                    ? (assessment.type as 'Quiz' | 'Exam' | 'Project')
                    : 'Quiz';

                return {
                    ...baseState,
                    assessment_title: assessment.title || null,
                    max_score: assessment.max_score || null,
                    assessment_type: initialAssessmentType,
                    questions_type: (assessment.questions_type as 'online' | 'file') || 'online',
                    submission_type: (assessment.submission_type as 'online' | 'written') || 'online',
                    assessment_content_json: assessment.content_json ? JSON.stringify(assessment.content_json) : null,
                    assessment_content_html: assessment.content_html || null,
                    assessment_instructions_json: assessment.instructions ? JSON.stringify(assessment.instructions) : null,
                    assessment_instructions_html: assessment.instructions_html || null,
                    questions: questions.length > 0 ? JSON.stringify(questions) : '[]',
                };
            } else if (itemType === 'assignment') {
                const assignment = item.itemable as Assignment;
                return {
                    ...baseState,
                    assignment_title: assignment.title || null,
                    total_points: assignment.total_points || null,
                    assignment_type: assignment.assignment_type || null,
                    started_at: assignment.started_at ? assignment.started_at.slice(0, 16) : null,
                    expired_at: assignment.expired_at ? assignment.expired_at.slice(0, 16) : null,
                    assignment_content_json: assignment.content_json ? JSON.stringify(assignment.content_json) : null,
                    assignment_content_html: assignment.content_html || null,
                    assignment_instructions_json: assignment.instructions ? JSON.stringify(assignment.instructions) : null,
                    assignment_instructions_html: assignment.instructions_html || null,
                    assignment_rubric_json: assignment.rubric ? JSON.stringify(assignment.rubric) : null,
                    assignment_rubric_html: assignment.rubric_html || null,
                };
            }
        }
        return baseState;
    };

    const initialData = getInitialFormState();

    const { data, setData, put, processing } = useForm<EditFormDataType>(initialData);

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

        const hasRichTextContent = (jsonContent: string | null): boolean => {
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

        if (itemType === 'assessment') {
            setData('questions', JSON.stringify(questions));
        }

        console.log('Submitting form data:', data);
        console.log('Assessment type being sent:', data.assessment_type);

        put(route('courses.modules.items.update', { course: course.id, module: module.id, item: item.id }), {
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                console.error('Form data that was sent:', data);
            }
        });
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
                        <h1 className="text-2xl font-bold">Edit Module Item</h1>
                        <p className="text-muted-foreground">Update the details for this module item</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle>Item Type</CardTitle>
                                    <CardDescription>This item is a <span className="capitalize font-semibold">{itemType}</span></CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {itemType === 'lecture' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Lecture Title</label>
                                                <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Enter lecture title" required />
                                            </div>
                                            <RichTextEditor label="Lecture Description" value={data.content_json} onChange={(json, html) => { setData('content_json', json); setData('content_html', html); }} />
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Video URL</label>
                                                <Input value={data.video_url || ''} onChange={e => setData('video_url', e.target.value)} placeholder="YouTube/Vimeo URL" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                                                <Input type="number" value={data.duration || ''} onChange={e => setData('duration', parseInt(e.target.value, 10))} min={0} />
                                            </div>
                                        </div>
                                    )}
                                    {itemType === 'assessment' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Assessment Title</label>
                                                <Input value={data.assessment_title || ''} onChange={e => setData('assessment_title', e.target.value)} placeholder="Quiz/Exam title" required />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Max Score</label>
                                                    <Input type="number" value={data.max_score || ''} onChange={e => setData('max_score', parseInt(e.target.value, 10))} min={1} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Assessment Type</label>
                                                    <select
                                                        id="assessment_type"
                                                        value={data.assessment_type}
                                                        onChange={e => setData('assessment_type', e.target.value as 'Quiz' | 'Exam' | 'Project')}
                                                        className="mt-2 flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background"
                                                    >
                                                        <option value="Quiz">Quiz</option>
                                                        <option value="Exam">Exam</option>
                                                        <option value="Project">Project</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <RichTextEditor label="Instructions" value={data.assessment_instructions_json} onChange={(json, html) => { setData('assessment_instructions_json', json); setData('assessment_instructions_html', html); }} />

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
                                                <Input value={data.assignment_title || ''} onChange={e => setData('assignment_title', e.target.value)} placeholder="Assignment title" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Total Points</label>
                                                <Input type="number" value={data.total_points || ''} onChange={e => setData('total_points', parseInt(e.target.value, 10))} min={1} />
                                            </div>
                                            <RichTextEditor label="Instructions" value={data.assignment_instructions_json} onChange={(json, html) => { setData('assignment_instructions_json', json); setData('assignment_instructions_html', html); }} />
                                            <RichTextEditor label="Rubric (optional)" value={data.assignment_rubric_json} onChange={(json, html) => { setData('assignment_rubric_json', json); setData('assignment_rubric_html', html); }} />
                                        </div>
                                    )}
                                    <div className="flex justify-end mt-8">
                                        <Button type="submit" disabled={processing} className="px-8 py-2 text-base font-semibold">
                                            {processing ? 'Saving...' : 'Update Item'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    <div className="space-y-6">
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
