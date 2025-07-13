import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Assessment, Assignment, BreadcrumbItem, CourseModuleItemEditPageProps, Lecture } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Eye, HelpCircle, Play, Save, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';

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
                assessment_type: 'Quiz' as 'Quiz' | 'Exam' | 'Project',
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
            const validAssessmentTypes = ['quiz', 'exam', 'project'];
            const initialAssessmentType = validAssessmentTypes.includes(assessment.type)
                ? (assessment.type as 'quiz' | 'exam' | 'project')
                : 'quiz'; // Default to 'quiz' if invalid
            return {
                ...baseData,
                video_url: '',
                duration: '',
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
                assessment_type: 'Quiz' as 'Quiz' | 'Exam' | 'Project',
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
        if (data.item_type === 'lecture') {
            const hasVideoUrl = data.video_url && data.video_url.trim() !== '';
            const hasContent = hasRichTextContent(data.content_json);

            if (!hasVideoUrl && !hasContent) {
                console.error('Either video URL or content required for lecture');
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

        put(route('courses.modules.items.update', { course: course.id, module: module.id, item: item.id }), {
            onError: (formErrors) => {
                console.error('Submission Errors:', formErrors);
            },
        });
    };

    // Validation helper
    const isFormValid = () => {
        if (!data.title.trim() || !data.item_type) return false;

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

        switch (data.item_type) {
            case 'lecture':
                return data.video_url.trim() || hasRichTextContent(data.content_json);
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
            color: 'text-blue-500',
        },
        {
            value: 'assessment',
            label: 'Assessment',
            icon: <HelpCircle className="h-4 w-4" />,
            description: 'Quiz, exam, or project assessment',
            color: 'text-orange-500',
        },
        {
            value: 'assignment',
            label: 'Assignment',
            icon: <ClipboardList className="h-4 w-4" />,
            description: 'Homework or project assignment',
            color: 'text-red-500',
        },
    ];

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
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Item Type</CardTitle>
                                <CardDescription>This item is a <span className="capitalize font-semibold">{itemType}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Dynamic Form Fields */}
                                {itemType === 'lecture' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Lecture Title</label>
                                            <Input value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Enter lecture title" required />
                                        </div>
                                        <RichTextEditor label="Lecture Description" value={data.description} onChange={(json, html) => { setData('content_json', json); setData('content_html', html); }} />
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Video URL</label>
                                            <Input value={data.video_url} onChange={e => setData('video_url', e.target.value)} placeholder="YouTube/Vimeo URL" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                                            <Input type="number" value={data.duration} onChange={e => setData('duration', Number(e.target.value))} min={0} />
                                        </div>
                                    </div>
                                )}
                                {itemType === 'assessment' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Assessment Title</label>
                                            <Input value={data.assessment_title} onChange={e => setData('assessment_title', e.target.value)} placeholder="Quiz/Exam title" required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Max Score</label>
                                                <Input type="number" value={data.max_score} onChange={e => setData('max_score', Number(e.target.value))} min={1} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Assessment Type</label>
                                                <select className="border rounded-md px-3 py-2 w-full" value={data.assessment_type} onChange={e => setData('assessment_type', e.target.value as 'Quiz' | 'Exam' | 'Project')}>
                                                    <option value="Quiz">Quiz</option>
                                                    <option value="Exam">Exam</option>
                                                    <option value="Project">Project</option>
                                                </select>
                                            </div>
                                        </div>
                                        <RichTextEditor label="Instructions" value={data.assessment_instructions_json} onChange={(json, html) => { setData('assessment_instructions_json', json); setData('assessment_instructions_html', html); }} />
                                        {/* If QuestionBuilder is used in Edit, include it here: */}
                                        {typeof QuestionBuilder !== 'undefined' && (
                                            <QuestionBuilder questions={data.questions ? JSON.parse(data.questions) : []} onChange={q => setData('questions', JSON.stringify(q))} />
                                        )}
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
                                            <Input type="number" value={data.total_points} onChange={e => setData('total_points', Number(e.target.value))} min={1} />
                                        </div>
                                        <RichTextEditor label="Instructions" value={data.assignment_instructions_json} onChange={(json, html) => { setData('assignment_instructions_json', json); setData('assignment_instructions_html', html); }} />
                                        <RichTextEditor label="Rubric (optional)" value={data.assignment_rubric_json} onChange={(json, html) => { setData('assignment_rubric_json', json); setData('assignment_rubric_html', html); }} />
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
                    </div>

                    {/* Sidebar - Tips and Guidelines */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tips for Great Items</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Be clear and concise in your titles and instructions.</li>
                                    <li>For assessments, add a variety of question types.</li>
                                    <li>Use the rich text editor for formatting and clarity.</li>
                                    <li>Set appropriate points and durations.</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">Preview will appear after saving.</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Edit;
