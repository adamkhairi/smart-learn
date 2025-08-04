import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Course, Assignment } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Upload,
    FileText,
    Clock,
    CheckCircle,
    X,
    Paperclip,
    Calendar,
    User
} from 'lucide-react';

interface AssignmentSubmitProps {
    course: Course;
    assignment: Assignment & {
        due_date?: string;
        points?: number;
        instructions?: string;
        rubric?: any;
    };
    existingSubmission?: {
        id: number;
        submission_text?: string;
        files?: string[];
        submitted_at: string;
    } | null;
}

export default function AssignmentSubmit({ course, assignment, existingSubmission }: AssignmentSubmitProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        submission_text: existingSubmission?.submission_text || '',
        files: [] as File[],
    });

    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
    const timeUntilDue = assignment.due_date ?
        Math.max(0, new Date(assignment.due_date).getTime() - new Date().getTime()) : 0;

    const formatTimeRemaining = (milliseconds: number) => {
        if (milliseconds <= 0) return 'Overdue';

        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter(file => {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }

            // Check file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed',
                'image/jpeg',
                'image/png',
                'image/jpg'
            ];

            if (!allowedTypes.includes(file.type)) {
                alert(`File ${file.name} is not an allowed type.`);
                return false;
            }

            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setData('files', [...selectedFiles, ...validFiles]);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('files', newFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.submission_text.trim() && selectedFiles.length === 0) {
            alert('Please provide either text submission or upload files.');
            return;
        }

        post(`/courses/${course.id}/assignments/${assignment.id}/submit`, {
            onSuccess: () => {
                reset();
                setSelectedFiles([]);
            },
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={`/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Course
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{assignment.title}</h1>
                    <p className="text-muted-foreground">{course.title}</p>
                </div>
                <div className="flex items-center gap-3">
                    {assignment.points && (
                        <Badge variant="outline" className="text-lg px-4 py-2">
                            {assignment.points} points
                        </Badge>
                    )}
                </div>
            </div>

            {/* Due Date Alert */}
            {assignment.due_date && (
                <Alert className={`border-l-4 ${
                    isOverdue ? 'border-l-red-500 bg-red-50' :
                    timeUntilDue < 24 * 60 * 60 * 1000 ? 'border-l-orange-500 bg-orange-50' :
                    'border-l-blue-500 bg-blue-50'
                }`}>
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                        {isOverdue ? (
                            <span className="text-red-700">
                                This assignment was due on {new Date(assignment.due_date).toLocaleString()}
                            </span>
                        ) : (
                            <span className={timeUntilDue < 24 * 60 * 60 * 1000 ? 'text-orange-700' : 'text-blue-700'}>
                                Due: {new Date(assignment.due_date).toLocaleString()} ({formatTimeRemaining(timeUntilDue)})
                            </span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Existing Submission Alert */}
            {existingSubmission && (
                <Alert className="border-l-4 border-l-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-700">
                        You have already submitted this assignment on {new Date(existingSubmission.submitted_at).toLocaleString()}.
                        You can update your submission below.
                    </AlertDescription>
                </Alert>
            )}

            {/* Assignment Instructions */}
            {assignment.instructions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: assignment.instructions }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Submission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Text Submission
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="submission_text">Your Response</Label>
                            <Textarea
                                id="submission_text"
                                value={data.submission_text}
                                onChange={(e) => setData('submission_text', e.target.value)}
                                placeholder="Enter your assignment response here..."
                                className="min-h-[200px] mt-2"
                                rows={8}
                            />
                            {errors.submission_text && (
                                <p className="text-red-600 text-sm mt-1">{errors.submission_text}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* File Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            File Attachments
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Drag and Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                Drop files here or click to browse
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (Max 10MB each)
                            </p>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                            />
                            <Button type="button" variant="outline" asChild>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose Files
                                </label>
                            </Button>
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Selected Files:</h4>
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <div>
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.files && (
                            <p className="text-red-600 text-sm">{errors.files}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rubric (if available) */}
                {assignment.rubric && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Grading Rubric
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: assignment.rubric }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <Button
                        type="submit"
                        disabled={processing || (!data.submission_text.trim() && selectedFiles.length === 0)}
                        size="lg"
                        className="px-8"
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {existingSubmission ? 'Updating...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {existingSubmission ? 'Update Submission' : 'Submit Assignment'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
