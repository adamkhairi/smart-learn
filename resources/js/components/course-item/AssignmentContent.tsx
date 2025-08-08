import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Assignment } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, ClipboardList, Download, FileText, Paperclip, Star, Upload, X } from 'lucide-react';
import { ChangeEvent, useState, useEffect, useCallback } from 'react';

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
    className?: string;
    courseId?: number;
    onMarkComplete?: () => void;
}

export default function AssignmentContent({
    assignment,
    userSubmission,
    isCompleted,
    isInstructor,
    className = '',
    courseId,
    onMarkComplete,
}: AssignmentContentProps) {
    const isOpen = assignment.status === 'open';
    const isEnded = assignment.status === 'ended';
    const hasSubmitted = !!userSubmission;

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

            // Check file size (10MB = 10 * 1024 * 1024 bytes) - consistent with backend
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                console.log('File too large, showing dialog');
                confirm({
                    title: 'File Size Limit Exceeded',
                    description: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 10MB limit. Please choose a smaller file.`,
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

    const { data, post, processing, errors, reset } = useForm({
        file: null as File | null,
        submission_text: '',
    });

    const handleSubmit = useCallback(() => {
        if (selectedFile && courseId && !isSubmitting) {
            console.log('Starting file submission:', {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                courseId,
                assignmentId: assignment.id
            });

            setIsSubmitting(true);

            // Create form data with the file and submission text
            const formData = {
                file: selectedFile,
                submission_text: data.submission_text || ''
            };

            console.log('Form data being submitted:', {
                hasFile: !!formData.file,
                fileName: formData.file?.name,
                fileSize: formData.file?.size,
                submissionText: formData.submission_text
            });

            // Use Inertia router for file uploads with proper FormData handling
            router.post(`/courses/${courseId}/assignments/${assignment.id}/submit`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    console.log('Submission successful');
                    setSelectedFile(null);
                    setIsSubmitting(false);
                    reset();
                },
                onError: (errors: any) => {
                    console.error('Submission failed:', errors);
                    console.error('Error details:', errors);
                    setIsSubmitting(false);
                }
            });
        } else {
            console.error('Missing requirements:', {
                selectedFile: !!selectedFile,
                courseId,
                isSubmitting
            });
        }
    }, [selectedFile, courseId, assignment.id, data.submission_text, isSubmitting, post, reset]);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Assignment Quick Info - Only show when relevant */}
            {(!hasSubmitted || isInstructor) && (
                <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                isOpen ? 'bg-green-100 dark:bg-green-900/30' :
                                isEnded ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                                <ClipboardList className={`h-5 w-5 ${
                                    isOpen ? 'text-green-600 dark:text-green-400' :
                                    isEnded ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                                }`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {assignment.assignment_type ? assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1) : 'Assignment'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    {assignment.total_points && (
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            {assignment.total_points} points
                                        </span>
                                    )}
                                    {assignment.expired_at && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Due {new Date(assignment.expired_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant={getStatusVariant(assignment.status)}
                            className={`${
                                isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                isEnded ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
                            {isOpen ? 'Open' : isEnded ? 'Closed' : assignment.status.replace('-', ' ')}
                        </Badge>
                    </div>
                </div>
            )}

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
                <Card className="border-indigo-500 bg-indigo-100 dark:bg-indigo-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                            <AlertCircle className="h-5 w-5" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-indigo-900 dark:text-indigo-100">
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
                <Card className="border-orange-500 bg-orange-100 dark:bg-orange-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                            <Star className="h-5 w-5" />
                            Grading Rubric
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-orange-900 dark:text-orange-100">
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
                <Card className="border-indigo-500 bg-indigo-100 dark:bg-indigo-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                            <CheckCircle className="h-5 w-5" />
                            Submission Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-indigo-700 dark:text-indigo-300">
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
                                    <p className="mb-2 text-sm font-medium text-indigo-800 dark:text-indigo-200">Submitted Files:</p>
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

                        {/* Note: Grading information is now displayed in the separate GradingStatus component */}
                    </CardContent>
                </Card>
            )}

            {/* File Submission Form */}
            {isOpen && !hasSubmitted && !isInstructor && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Submit Your Work</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Upload your assignment file</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {(() => {
                            console.log('Rendering file selection UI, selectedFile:', !!selectedFile, selectedFile?.name);
                            return selectedFile;
                        })() ? (
                            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm dark:border-green-800 dark:bg-green-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <Paperclip className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-800 dark:text-green-200">{selectedFile?.name}</span>
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB • Ready to submit
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full items-center justify-center">
                                <Label
                                    htmlFor="file-upload"
                                    className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
                                >
                                    <div className="flex flex-col items-center justify-center pt-6 pb-6">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="mb-2 text-base font-medium text-gray-700 dark:text-gray-300">
                                            <span className="text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, JPEG, PNG</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Maximum file size: 10MB</p>
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
                            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">Upload Error</p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errors.file}</p>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={!selectedFile || isSubmitting || processing}
                            size="lg"
                        >
                            <div className="flex items-center justify-center gap-2">
                                {(isSubmitting || processing) ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardList className="h-4 w-4" />
                                        <span>Submit Assignment</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Assignment Closed Message */}
            {!isOpen && !hasSubmitted && !isInstructor && (
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-sm dark:border-orange-800 dark:from-orange-950/30 dark:to-red-950/30">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <ClipboardList className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Assignment {isEnded ? 'Closed' : 'Not Available'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            {isEnded
                                ? 'The submission period for this assignment has ended. Contact your instructor if you need assistance.'
                                : 'This assignment is not yet available for submission. Please check back later.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Progress Section */}
            <div className="flex flex-col items-center gap-4">
                {/* Completion Status */}
                {isCompleted && (
                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 shadow-sm dark:border-green-800 dark:from-green-950/30 dark:to-emerald-950/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Assignment Completed</p>
                            <p className="text-sm text-green-600 dark:text-green-400">Great job! You've successfully completed this assignment.</p>
                        </div>
                    </div>
                )}

                {/* Instructor Note */}
                {isInstructor && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-950/30">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-medium">Instructor View:</span> You can view the assignment content, but submission features are disabled for instructors.
                        </p>
                    </div>
                )}
            </div>

            {/* Custom Dialog */}
            {confirmDialog}
        </div>
    );
}
