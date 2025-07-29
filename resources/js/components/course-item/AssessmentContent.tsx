import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Assessment } from '@/types';
import { Link } from '@inertiajs/react';
import { AlertCircle, Award, CheckCircle, Download, FileText, HelpCircle, Settings } from 'lucide-react';

interface UserSubmission {
    id: number;
    submitted_at: string;
    finished?: boolean;
    score?: number | null;
}

interface AssessmentContentProps {
    assessment: Assessment;
    courseId: number;
    userSubmission?: UserSubmission | null;
    isCompleted: boolean;
    isInstructor: boolean;
    onMarkComplete?: () => void;
    className?: string;
}

export default function AssessmentContent({
    assessment,
    courseId,
    userSubmission,
    isCompleted,
    isInstructor,
    onMarkComplete,
    className = '',
}: AssessmentContentProps) {
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
                return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline">${content}</a>`;
            }

            if (nodeData.children && Array.isArray(nodeData.children)) {
                return nodeData.children.map(convertNodeToHTML).join('');
            }

            return '';
        };

        return root.children.map(convertNodeToHTML).join('');
    };

    const formatDuration = (durationInMinutes?: number) => {
        if (!durationInMinutes) return null;
        const minutes = Math.floor(durationInMinutes);
        const seconds = (durationInMinutes % 1) * 60;
        if (minutes > 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        return seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes} min`;
    };

    const getStatusVariant = (visibility: string) => {
        switch (visibility) {
            case 'published':
                return 'default';
            case 'draft':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (visibility: string) => {
        switch (visibility) {
            case 'published':
                return {
                    border: 'border-blue-200',
                    bg: 'bg-blue-50',
                    text: 'text-gray-800 dark:text-gray-200',
                    icon: 'text-blue-600',
                };
            case 'draft':
                return {
                    border: 'border-gray-200',
                    bg: 'bg-gray-50',
                    text: 'text-gray-800 dark:text-gray-200',
                    icon: 'text-gray-600',
                };
            default:
                return {
                    border: 'border-gray-200',
                    bg: 'bg-gray-50',
                    text: 'text-gray-800 dark:text-gray-200',
                    icon: 'text-gray-600',
                };
        }
    };

    const statusColors = getStatusColor(assessment.visibility);
    const hasFinished = userSubmission?.finished;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Assessment Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <HelpCircle className={`h-6 w-6 ${statusColors.icon}`} />
                            <h3 className={`text-xl font-semibold ${statusColors.text}`}>
                                {assessment.type?.charAt(0).toUpperCase() + assessment.type?.slice(1)} Assessment
                            </h3>
                        </div>
                        <Badge variant={getStatusVariant(assessment.visibility)}>{assessment.visibility?.toUpperCase()}</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        {assessment.max_score && (
                            <div className={`flex items-center gap-2 ${statusColors.text}`}>
                                <span className="font-medium">Max Score:</span> {assessment.max_score} points
                            </div>
                        )}
                        {assessment.time_limit && (
                            <div className={`flex items-center gap-2 ${statusColors.text}`}>
                                <span className="font-medium">Time Limit:</span> {formatDuration(assessment.time_limit)}
                            </div>
                        )}
                        {assessment.questions_type && (
                            <div className={`flex items-center gap-2 ${statusColors.text}`}>
                                <span className="font-medium">Question Type:</span> {assessment.questions_type}
                            </div>
                        )}
                        {assessment.submission_type && (
                            <div className={`flex items-center gap-2 ${statusColors.text}`}>
                                <span className="font-medium">Submission Type:</span> {assessment.submission_type}
                            </div>
                        )}
                    </div>

                    {/* Availability Dates */}
                    {(assessment.available_from || assessment.available_until) && (
                        <div className={`mt-4 grid grid-cols-1 gap-3 text-sm ${statusColors.text} md:grid-cols-2`}>
                            {assessment.available_from && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Available From:</span> {new Date(assessment.available_from).toLocaleString()}
                                </div>
                            )}
                            {assessment.available_until && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Available Until:</span> {new Date(assessment.available_until).toLocaleString()}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assessment Content */}
            {assessment.content_html && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-orange-500" />
                            Assessment Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: assessment.content_html }} />
                    </CardContent>
                </Card>
            )}

            {/* Assessment Instructions */}
            {assessment.instructions && Object.keys(assessment.instructions).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
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
                    </CardContent>
                </Card>
            )}

            {/* Assessment Settings */}
            {(assessment.randomize_questions || assessment.show_results !== undefined) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Assessment Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            {assessment.randomize_questions && (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span>Questions will be randomized</span>
                                </div>
                            )}
                            {assessment.show_results !== undefined && (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span>Results will {assessment.show_results ? 'be shown' : 'not be shown'} after submission</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Questions Preview */}
            {assessment.questions && assessment.questions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-orange-500" />
                            Questions Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This assessment contains {assessment.questions.length} question
                            {assessment.questions.length > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-3">
                            {assessment.questions.slice(0, 3).map((question) => (
                                <div
                                    key={question.id}
                                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                >
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            Question {question.question_number}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {question.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {question.points} point{question.points > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {question.question_text?.substring(0, 100)}
                                        {question.question_text && question.question_text.length > 100 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                            {assessment.questions.length > 3 && (
                                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        ...and {assessment.questions.length - 3} more question
                                        {assessment.questions.length - 3 > 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Primary Action */}
                        {hasFinished ? (
                            <Button className="flex-1" size="lg" asChild>
                                <Link href={`/courses/${courseId}/assessments/${assessment.id}/results`}>
                                    <Award className="mr-2 h-4 w-4" />
                                    View Results
                                </Link>
                            </Button>
                        ) : (
                            <Button className="flex-1" size="lg" asChild>
                                <Link href={`/courses/${courseId}/assessments/${assessment.id}/take`}>
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Start Assessment
                                </Link>
                            </Button>
                        )}

                        {/* Download Materials */}
                        {assessment.files && assessment.files.length > 0 && (
                            <Button variant="outline" size="lg">
                                <Download className="mr-2 h-4 w-4" />
                                Download Materials
                            </Button>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 text-center">
                        {hasFinished ? (
                            <p className="text-sm text-muted-foreground">
                                You have completed this assessment. Click "View Results" to see your performance.
                            </p>
                        ) : userSubmission ? (
                            <p className="text-sm text-muted-foreground">You have an in-progress attempt. Click "Start Assessment" to continue.</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Click "Start Assessment" when you're ready to begin. Make sure you have enough time to complete it.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Progress Section */}
            <div className="flex flex-col items-center gap-4">
                {/* Mark as Complete Button */}
                {!isInstructor && !isCompleted && onMarkComplete && (
                    <Button onClick={onMarkComplete} className="bg-orange-600 transition-colors hover:bg-orange-700" size="lg">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                    </Button>
                )}

                {/* Completion Status */}
                {isCompleted && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-6 py-3 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Assessment Completed</span>
                    </div>
                )}

                {/* View Results Button for Completed Assessments */}
                {!isInstructor && isCompleted && hasFinished && (
                    <Button asChild variant="outline" size="lg">
                        <Link href={`/courses/${courseId}/assessments/${assessment.id}/results`}>
                            <Award className="mr-2 h-4 w-4" />
                            View Detailed Results
                        </Link>
                    </Button>
                )}

                {/* Instructor Note */}
                {isInstructor && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>As an instructor, you can preview the assessment but taking it is disabled.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
