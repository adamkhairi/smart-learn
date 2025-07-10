import { ModuleNavigation } from '@/components/module-navigation';
import { NavigationBreadcrumb } from '@/components/navigation-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { getDisplayableContent } from '@/lib/content-renderer';
import { Assessment, Assignment, CourseModuleItemShowPageProps, Lecture } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Clock,
    Download,
    Edit,
    ExternalLink,
    FileText,
    HelpCircle,
    Paperclip,
    Play,
    Star,
    Upload,
    X,
} from 'lucide-react';
import { ChangeEvent } from 'react';

function Show({ course, module, item, userSubmission }: CourseModuleItemShowPageProps) {
    const { canManageCourse } = useAuth();
    const isInstructor = canManageCourse(course.created_by);

    // Navigation items for breadcrumb
    const navigationItems = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: item.title, href: '#', isActive: true },
    ];

    // Find previous and next items for navigation
    const items = module.moduleItems || [];
    const currentIndex = items.findIndex((i) => i.id === item.id);
    const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    // Helper function to get item type from polymorphic relationship
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' | 'unknown' => {
        if (item.item_type_name) return item.item_type_name;

        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';

        return 'unknown';
    };

    const itemType = getItemType();

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'lecture':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'assessment':
                return <HelpCircle className="h-5 w-5 text-orange-500" />;
            case 'assignment':
                return <ClipboardList className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return null;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // Helper function to get displayable HTML content
    const getDisplayContent = (contentData: { content_html?: string; content_json?: string | object; content?: string }): string => {
        return getDisplayableContent(contentData);
    };

    // Helper function to convert Lexical JSON to HTML
    const convertLexicalToHTML = (editorState: unknown): string => {
        const root = (editorState as { root?: { children?: unknown[] } })?.root;
        if (!root?.children) return '';

        const convertNodeToHTML = (node: unknown): string => {
            const nodeData = node as Record<string, unknown>;

            if (nodeData.type === 'text') {
                let text = (nodeData.text as string) || '';
                if (nodeData.format) {
                    const format = nodeData.format as number;
                    if (format & 1) text = `<strong>${text}</strong>`;
                    if (format & 2) text = `<em>${text}</em>`;
                    if (format & 8) text = `<u>${text}</u>`;
                }
                return text;
            }

            if (nodeData.type === 'paragraph') {
                const children = (nodeData.children as unknown[]) || [];
                const content = children.map(convertNodeToHTML).join('');
                if (!content.trim()) return '<p><br></p>';
                const alignment = (nodeData.format as string) || 'left';
                const alignClass = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
                return `<p${alignClass}>${content}</p>`;
            }

            if (nodeData.type === 'heading') {
                const children = (nodeData.children as unknown[]) || [];
                const content = children.map(convertNodeToHTML).join('');
                if (!content.trim()) return '';
                const tag = (nodeData.tag as string) || 'h1';
                const alignment = (nodeData.format as string) || 'left';
                const alignClass = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
                return `<${tag}${alignClass}>${content}</${tag}>`;
            }

            if (nodeData.type === 'list') {
                const children = (nodeData.children as unknown[]) || [];
                const content = children.map(convertNodeToHTML).join('');
                if (!content.trim()) return '';
                const tag = (nodeData.listType as string) === 'number' ? 'ol' : 'ul';
                return `<${tag}>${content}</${tag}>`;
            }

            if (nodeData.type === 'listitem') {
                const children = (nodeData.children as unknown[]) || [];
                const content = children.map(convertNodeToHTML).join('');
                return `<li>${content}</li>`;
            }

            if (nodeData.type === 'link') {
                const children = (nodeData.children as unknown[]) || [];
                const content = children.map(convertNodeToHTML).join('');
                const url = (nodeData.url as string) || '#';
                return `<a href="${url}">${content}</a>`;
            }

            if (nodeData.children && Array.isArray(nodeData.children)) {
                return nodeData.children.map(convertNodeToHTML).join('');
            }

            return '';
        };

        return root.children.map(convertNodeToHTML).join('');
    };

    // New component to render lecture content
    const LectureContent = ({ lecture }: { lecture: Lecture }) => {
        const videoUrl = lecture.video_url ?? lecture.youtube_id;
        const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
        const displayContent = getDisplayContent({
            content_html: lecture.content_html,
            content_json: lecture.content_json,
            content: lecture.content,
        });

        return (
            <div className="space-y-6">
                {embedUrl ? (
                    <div className="space-y-4">
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            <iframe
                                src={embedUrl}
                                title={lecture.title}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ExternalLink className="h-4 w-4" />
                            <a href={videoUrl!} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                Watch on YouTube
                            </a>
                        </div>
                    </div>
                ) : (
                    !displayContent && (
                        <div className="rounded-lg bg-muted py-8 text-center">
                            <Play className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No video provided for this lecture.</p>
                        </div>
                    )
                )}

                {displayContent && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lecture Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="lecture-content prose prose-lg dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const AssignmentContent = ({ assignment }: { assignment: Assignment }) => {
        const isOpen = assignment.status === 'open';
        const isEnded = assignment.status === 'ended';

        const { data, setData, post, processing, reset } = useForm({
            submission_file: null as File | null,
        });

        // Check if user has already submitted
        const hasSubmitted = !!userSubmission;

        const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                setData('submission_file', e.target.files[0]);
            }
        };

        const handleRemoveFile = () => {
            setData('submission_file', null);
        };

        const handleSubmit = () => {
            if (data.submission_file) {
                post(`/assignments/${assignment.id}/submit`, {
                    onSuccess: () => {
                        // Reset form and show success
                        reset();
                        // The page will reload with updated userSubmission data
                    },
                });
            }
        };

        return (
            <div className="space-y-6">
                {/* Assignment Header */}
                <div
                    className={`rounded-lg border p-4 ${
                        isOpen ? 'border-green-200 bg-green-50' : isEnded ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                >
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ClipboardList className={`h-5 w-5 ${isOpen ? 'text-green-600' : isEnded ? 'text-red-600' : 'text-yellow-600'}`} />
                            <h3 className={`font-semibold ${isOpen ? 'text-green-800' : isEnded ? 'text-red-800' : 'text-yellow-800'}`}>
                                Assignment
                            </h3>
                        </div>
                        <Badge variant={isOpen ? 'default' : isEnded ? 'destructive' : 'secondary'}>{assignment.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className={`space-y-1 text-sm ${isOpen ? 'text-green-700' : isEnded ? 'text-red-700' : 'text-yellow-700'}`}>
                        {assignment.total_points && <p>Points: {assignment.total_points}</p>}
                        {assignment.expired_at && <p>Due: {new Date(assignment.expired_at).toLocaleDateString()}</p>}
                        {assignment.assignment_type && <p>Type: {assignment.assignment_type}</p>}
                    </div>
                </div>

                {/* Assignment Content */}
                {assignment.content_html && (
                    <div className="rounded-lg border bg-white p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <FileText className="h-5 w-5" />
                            Assignment Description
                        </h4>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: assignment.content_html }} />
                    </div>
                )}

                {/* Assignment Instructions */}
                {assignment.instructions && Object.keys(assignment.instructions).length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-800">
                            <AlertCircle className="h-5 w-5" />
                            Instructions
                        </h4>
                        <div className="prose prose-sm max-w-none text-blue-900">
                            {typeof assignment.instructions === 'string' ? (
                                <p>{assignment.instructions}</p>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: convertLexicalToHTML(assignment.instructions),
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Grading Rubric */}
                {assignment.rubric && Object.keys(assignment.rubric).length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-800">
                            <Star className="h-5 w-5" />
                            Grading Rubric
                        </h4>
                        <div className="prose prose-sm max-w-none text-amber-900">
                            {typeof assignment.rubric === 'string' ? (
                                <p>{assignment.rubric}</p>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: convertLexicalToHTML(assignment.rubric),
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Show submitted files if user has already submitted */}
                {hasSubmitted && userSubmission && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-800">Submission Completed</h3>
                        </div>
                        <div className="space-y-2 text-sm text-blue-700">
                            <p>Submitted: {new Date(userSubmission.submitted_at).toLocaleString()}</p>
                            {userSubmission.files && userSubmission.files.length > 0 && (
                                <div>
                                    <p className="mb-1 font-medium">Submitted Files:</p>
                                    {userSubmission.files.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 rounded border bg-white p-2">
                                            <Paperclip className="h-4 w-4" />
                                            <span className="flex-1">{file.split('/').pop()}</span>
                                            <a
                                                href={`/storage/${file}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {userSubmission.score !== null && (
                                <p className="font-medium">
                                    Grade: {userSubmission.score} / {assignment.total_points}
                                </p>
                            )}
                            {userSubmission.feedback && (
                                <div>
                                    <p className="mb-1 font-medium">Feedback:</p>
                                    <p className="rounded border bg-white p-2 text-sm">{userSubmission.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Only show submission form if assignment is open and user hasn't submitted */}
                {isOpen && !hasSubmitted && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Upload className="h-5 w-5" />
                            Submit Your Work
                        </h4>
                        <div className="space-y-3">
                            {data.submission_file ? (
                                <div className="flex items-center justify-between rounded-md border bg-white p-3">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="h-5 w-5" />
                                        <span className="text-sm font-medium">{data.submission_file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex w-full items-center justify-center">
                                    <Label
                                        htmlFor="file-upload"
                                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white hover:bg-gray-50"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX, ZIP, etc. (MAX. 10MB)</p>
                                        </div>
                                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                                    </Label>
                                </div>
                            )}
                            <Button className="w-full" onClick={handleSubmit} disabled={!data.submission_file || processing}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                {processing ? 'Submitting...' : 'Submit Assignment'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Show message if assignment is closed and user hasn't submitted */}
                {!isOpen && !hasSubmitted && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-gray-600">{isEnded ? 'This assignment has ended.' : 'This assignment is not yet available.'}</p>
                    </div>
                )}
            </div>
        );
    };

    const AssessmentContent = ({ assessment }: { assessment: Assessment }) => {
        return (
            <div className="space-y-6">
                {/* Assessment Header */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-800">
                                {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} Assessment
                            </h3>
                        </div>
                        <Badge variant={assessment.visibility === 'published' ? 'default' : 'secondary'}>{assessment.visibility}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-blue-700">
                        {assessment.max_score && <p>Max Score: {assessment.max_score} points</p>}
                        {assessment.time_limit && <p>Time Limit: {formatDuration(assessment.time_limit * 60)}</p>}
                        {assessment.questions_type && <p>Question Type: {assessment.questions_type}</p>}
                        {assessment.submission_type && <p>Submission Type: {assessment.submission_type}</p>}
                        {assessment.available_from && <p>Available From: {new Date(assessment.available_from).toLocaleString()}</p>}
                        {assessment.available_until && <p>Available Until: {new Date(assessment.available_until).toLocaleString()}</p>}
                    </div>
                </div>

                {/* Assessment Content */}
                {assessment.content_html && (
                    <div className="rounded-lg border bg-white p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <FileText className="h-5 w-5" />
                            Assessment Description
                        </h4>
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: assessment.content_html }} />
                    </div>
                )}

                {/* Assessment Instructions */}
                {assessment.instructions && Object.keys(assessment.instructions).length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-800">
                            <AlertCircle className="h-5 w-5" />
                            Instructions
                        </h4>
                        <div className="prose prose-sm max-w-none text-amber-900">
                            {typeof assessment.instructions === 'string' ? (
                                <p>{assessment.instructions}</p>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: convertLexicalToHTML(assessment.instructions),
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Assessment Settings */}
                {(assessment.randomize_questions || assessment.show_results !== undefined) && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Assessment Settings</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            {assessment.randomize_questions && <p>• Questions will be randomized</p>}
                            {assessment.show_results !== undefined && (
                                <p>• Results will {assessment.show_results ? 'be shown' : 'not be shown'} after submission</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Questions Preview (if questions exist) */}
                {assessment.questions && assessment.questions.length > 0 && (
                    <div className="rounded-lg border bg-white p-6">
                        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <HelpCircle className="h-5 w-5" />
                            Questions Preview
                        </h4>
                        <p className="mb-4 text-sm text-muted-foreground">
                            This assessment contains {assessment.questions.length} question{assessment.questions.length > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2">
                            {assessment.questions.slice(0, 3).map((question) => (
                                <div key={question.id} className="rounded border border-gray-200 p-3">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">Question {question.question_number}</span>
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">{question.type}</span>
                                        <span className="text-xs text-gray-500">
                                            {question.points} point{question.points > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm">
                                        {question.question_text?.substring(0, 100)}
                                        {question.question_text && question.question_text.length > 100 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                            {assessment.questions.length > 3 && (
                                <p className="text-sm text-muted-foreground">...and {assessment.questions.length - 3} more questions</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button className="flex-1">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Start Assessment
                    </Button>
                    {assessment.files && assessment.files.length > 0 && (
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download Materials
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (!item.itemable) {
            return (
                <div className="py-8 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Content not available</p>
                </div>
            );
        }

        switch (itemType) {
            case 'lecture': {
                const lecture = item.itemable as Lecture;
                return <LectureContent lecture={lecture} />;
            }

            case 'assessment': {
                const assessment = item.itemable as Assessment;
                return <AssessmentContent assessment={assessment} />;
            }

            case 'assignment': {
                const assignment = item.itemable as Assignment;
                return <AssignmentContent assignment={assignment} />;
            }

            default:
                return (
                    <div className="py-8 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Content type not supported</p>
                    </div>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={`${item.title} - ${module.title} - ${course.name}`} />

            <div className="container mx-auto px-4 py-6">
                <NavigationBreadcrumb items={navigationItems} />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="mb-1 flex items-center gap-3">
                                {getItemIcon(itemType)}
                                <h1 className="text-2xl font-bold">{item.title}</h1>
                                {item.is_required && (
                                    <Badge variant="destructive" className="text-xs">
                                        Required
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)} • Item {currentIndex + 1} of {items.length} in {module.title}
                            </p>
                        </div>
                    </div>

                    {isInstructor && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {getItemIcon(itemType)}
                                            {item.title}
                                        </CardTitle>
                                        {item.description && <CardDescription className="mt-2">{item.description}</CardDescription>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {itemType === 'lecture' && item.itemable && (item.itemable as Lecture).duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {formatDuration((item.itemable as Lecture).duration)}
                                            </div>
                                        )}
                                        {item.view_count && item.view_count > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span>{item.view_count} views</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>{renderContent()}</CardContent>
                        </Card>

                        {/* Previous/Next Navigation */}
                        <div className="mt-6 flex justify-between">
                            {previousItem ? (
                                <Button variant="outline" asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous: {previousItem.title}
                                    </Link>
                                </Button>
                            ) : (
                                <div />
                            )}

                            {nextItem ? (
                                <Button asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                                        Next: {nextItem.title}
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <ModuleNavigation course={course} module={module} currentItem={item} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
