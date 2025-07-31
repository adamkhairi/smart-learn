import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Assignment } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, ClipboardList, Download, FileText, Paperclip, Star, Upload, X } from 'lucide-react';
import { ChangeEvent, useState, useEffect } from 'react';

interface SubmissionFile {
    id?: number;
    file_path: string;
    original_name: string;
    file_size?: number;
}

interface UserSubmission {
    id: number;
    submitted_at: string;
    files?: string[] | any[];
    file_path?: string;
    original_filename?: string;
    file_size?: number;
    file_type?: string;
    score?: number | null;
    feedback?: string;
    finished?: boolean;
}

interface AssignmentContentProps {
    assignment: Assignment;
    userSubmission?: UserSubmission | null;
    isCompleted: boolean;
    isInstructor: boolean;
    onMarkComplete?: () => void;
    className?: string;
    courseId?: number;
}

export default function AssignmentContent({
    assignment,
    userSubmission,
    isCompleted,
    isInstructor,
    onMarkComplete,
    className = '',
    courseId,
}: AssignmentContentProps) {
    const isOpen = assignment.status === 'open';
    const isEnded = assignment.status === 'ended';
    const hasSubmitted = !!userSubmission;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { confirm, confirmDialog } = useConfirmDialog();

    // Debug: Track selectedFile state changes
    useEffect(() => {
        console.log('selectedFile state changed:', {
            hasFile: !!selectedFile,
            fileName: selectedFile?.name,
            fileSize: selectedFile?.size
        });
    }, [selectedFile]);

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

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open':
                return 'default';
            case 'ended':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return {
                    border: 'border-green-200',
                    bg: 'bg-green-50',
                    text: 'text-green-800',
                    icon: 'text-green-600',
                };
            case 'ended':
                return {
                    border: 'border-red-200',
                    bg: 'bg-red-50',
                    text: 'text-red-800',
                    icon: 'text-red-600',
                };
            default:
                return {
                    border: 'border-yellow-200',
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-600',
                };
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log('File selection event:', { file, hasFile: !!file });

        if (file) {
            console.log('File details:', {
                name: file.name,
                size: file.size,
                sizeInMB: (file.size / 1024 / 1024).toFixed(2),
                type: file.type
            });

            // Check file size (3MB = 3 * 1024 * 1024 bytes) - temporarily increased for testing
            const maxSize = 3 * 1024 * 1024;
            if (file.size > maxSize) {
                console.log('File too large, showing dialog');
                confirm({
                    title: 'File Size Limit Exceeded',
                    description: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 3MB limit. Please choose a smaller file.`,
                    confirmText: 'OK',
                    onConfirm: () => {},
                    variant: 'destructive'
                });
                // Clear the input
                e.target.value = '';
                return;
            }

            console.log('File size OK, setting selected file');
            setSelectedFile(file);
        } else {
            console.log('No file selected');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        submission_text: '',
    });

    const handleSubmit = () => {
        if (selectedFile && courseId) {
            console.log('Starting file submission:', {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                courseId,
                assignmentId: assignment.id
            });

            // Set the file data - use 'file' (singular) to match backend expectation
            setData('file', selectedFile);

            // Submit using Inertia
            post(`/courses/${courseId}/assignments/${assignment.id}/submit`, {
                onSuccess: () => {
                    console.log('Submission successful');
                    setSelectedFile(null);
                    reset();
                },
                onError: (errors) => {
                    console.error('Submission failed:', errors);
                }
            });
        } else {
            console.error('Missing requirements:', { selectedFile: !!selectedFile, courseId });
        }
    };

    const statusColors = getStatusColor(assignment.status);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Assignment Header */}
            <Card className={`${statusColors.border} ${statusColors.bg}`}>
                <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ClipboardList className={`h-5 w-5 ${statusColors.icon}`} />
                            <h3 className={`font-semibold ${statusColors.text}`}>Assignment</h3>
                        </div>
                        <Badge variant={getStatusVariant(assignment.status)}>{assignment.status.replace('-', ' ').toUpperCase()}</Badge>
                    </div>
                    <div className={`grid grid-cols-1 gap-2 text-sm ${statusColors.text}`}>
                        {assignment.total_points && (
                            <div>
                                <span className="font-medium">Points:</span> {assignment.total_points}
                            </div>
                        )}
                        {assignment.expired_at && (
                            <div>
                                <span className="font-medium">Due:</span> {new Date(assignment.expired_at).toLocaleDateString()}
                            </div>
                        )}
                        {assignment.assignment_type && (
                            <div>
                                <span className="font-medium">Type:</span> {assignment.assignment_type}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Status:</span> {assignment.status.replace('-', ' ')}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignment Content */}
            {assignment.content_html && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-500" />
                            Assignment Description
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: assignment.content_html }} />
                    </CardContent>
                </Card>
            )}

            {/* Assignment Instructions */}
            {assignment.instructions && Object.keys(assignment.instructions).length > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <AlertCircle className="h-5 w-5" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-100">
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
                    </CardContent>
                </Card>
            )}

            {/* Grading Rubric */}
            {assignment.rubric && Object.keys(assignment.rubric).length > 0 && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                            <Star className="h-5 w-5" />
                            Grading Rubric
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-amber-900 dark:text-amber-100">
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
                    </CardContent>
                </Card>
            )}

            {/* Submission Status */}
            {hasSubmitted && userSubmission && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <CheckCircle className="h-5 w-5" />
                            Submission Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p>
                                <span className="font-medium">Submitted:</span> {new Date(userSubmission.submitted_at).toLocaleString()}
                            </p>
                        </div>


                        {/* Submitted Files */}
                        {(() => {
                            // Check if there are any files to display
                            const hasFiles = userSubmission.file_path ||
                                            (userSubmission.files && Array.isArray(userSubmission.files) && userSubmission.files.length > 0);

                            if (!hasFiles) return null;

                            return (
                                <div>
                                    <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">Submitted Files:</p>
                                    <div className="space-y-2">
                                        {/* Handle single file submission (file_path field) - for backward compatibility */}
                                        {userSubmission.file_path && !userSubmission.files && (
                                            <div className="flex items-center gap-3 rounded border bg-white p-3 shadow-sm dark:bg-gray-900">
                                                <Paperclip className="h-4 w-4 text-gray-500" />
                                                <span className="flex-1 text-sm">
                                                    {userSubmission.original_filename || userSubmission.file_path.split('/').pop()}
                                                </span>
                                                <Button size="sm" variant="ghost" asChild>
                                                    <a
                                                        href={`/courses/${courseId}/assignments/${assignment.id}/submissions/${userSubmission.id}/download/${encodeURIComponent(userSubmission.original_filename || 'file')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        )}

                                        {/* Handle files array (new standardized format) */}
                                        {userSubmission.files && Array.isArray(userSubmission.files) && userSubmission.files.map((file, index) => {
                                            // Extract filename from file path
                                            const fileName = typeof file === 'string' ? file.split('/').pop() :
                                                           (typeof file === 'object' && file.original_filename ? file.original_filename : `File ${index + 1}`);

                                            // Create download filename
                                            const downloadFileName = typeof file === 'string' ? fileName :
                                                                    (typeof file === 'object' && file.original_filename ? file.original_filename : `file-${index}`);

                                            return (
                                                <div key={index} className="flex items-center gap-3 rounded border bg-white p-3 shadow-sm dark:bg-gray-900">
                                                    <Paperclip className="h-4 w-4 text-gray-500" />
                                                    <span className="flex-1 text-sm">
                                                        {fileName}
                                                    </span>
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <a
                                                            href={`/courses/${courseId}/assignments/${assignment.id}/submissions/${userSubmission.id}/download/${encodeURIComponent(downloadFileName)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Grade */}
                        {userSubmission.score !== null && (
                            <div className="rounded border bg-white p-3 dark:bg-gray-900">
                                <p className="text-sm">
                                    <span className="font-medium">Grade:</span> {userSubmission.score} / {assignment.total_points}
                                </p>
                            </div>
                        )}

                        {/* Feedback */}
                        {userSubmission.feedback && (
                            <div>
                                <p className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">Instructor Feedback:</p>
                                <div className="rounded border bg-white p-3 text-sm dark:bg-gray-900">{userSubmission.feedback}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* File Submission Form */}
            {isOpen && !hasSubmitted && !isInstructor && (
                <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-500" />
                            Submit Your Work
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(() => {
                            console.log('Rendering file selection UI, selectedFile:', !!selectedFile, selectedFile?.name);
                            return selectedFile;
                        })() ? (
                            <div className="flex items-center justify-between rounded-md border bg-white p-4 shadow-sm dark:bg-gray-800">
                                <div className="flex items-center gap-3">
                                    <Paperclip className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <span className="text-sm font-medium">{selectedFile?.name}</span>
                                        <p className="text-xs text-muted-foreground">{selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full items-center justify-center">
                                <Label
                                    htmlFor="file-upload"
                                    className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="mb-3 h-10 w-10 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, JPEG, PNG (MAX. 3MB)</p>
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.jpeg,.png"
                                    />
                                </Label>
                            </div>
                        )}

                        {errors.file && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                                <AlertCircle className="h-4 w-4 inline mr-2" />
                                {errors.file}
                            </div>
                        )}

                        <Button className="w-full" onClick={handleSubmit} disabled={!selectedFile || processing} size="lg">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            {processing ? 'Submitting...' : 'Submit Assignment'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Assignment Closed Message */}
            {!isOpen && !hasSubmitted && !isInstructor && (
                <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <ClipboardList className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">Assignment {isEnded ? 'Ended' : 'Not Available'}</h3>
                        <p className="text-muted-foreground">
                            {isEnded
                                ? 'The submission period for this assignment has ended.'
                                : 'This assignment is not yet available for submission.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Progress Section */}
            <div className="flex flex-col items-center gap-4">
                {/* Completion Status */}
                {isCompleted && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-6 py-3 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Assignment Completed</span>
                    </div>
                )}

                {/* Instructor Note */}
                {isInstructor && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>As an instructor, you can view the assignment but submission features are disabled.</p>
                    </div>
                )}
            </div>

            {/* Custom Dialog */}
            {confirmDialog}
        </div>
    );
}
