import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Course, Assessment, Submission, CourseModule } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Award, CheckCircle, XCircle, Clock, FileText, TrendingUp, Info, Download, Share } from 'lucide-react';

interface GradingDetail {
    question_id: number;
    is_correct: boolean;
    question_text: string;
    score: number;
    max_score: number;
    feedback?: string;
    user_answer: string | number | null;
    correct_answer: string | number | null;
}

interface AssessmentResultsProps {
    course: Course;
    assessment: Assessment;
    submission: Submission & {
        score?: number;
        max_score?: number;
        percentage?: number;
        grading_details?: Record<string, GradingDetail>;
        time_spent?: number;
        graded_at?: string;
    };
    module?: CourseModule;
}

export default function AssessmentResults({ course, assessment, submission, module }: AssessmentResultsProps) {
    const percentage = submission.percentage || 0;
    const score = submission.score || 0;
    const maxScore = submission.max_score || assessment.max_score || 100;
    const timeSpent = submission.time_spent || 0;
    const gradingDetails = submission.grading_details || {};

    // Calculate questions count from assessment if grading details are missing
    const questionsCount = Object.keys(gradingDetails).length > 0
        ? Object.keys(gradingDetails).length
        : assessment.questions?.length || 0;

    // Calculate correct answers from grading details if available
    const correctAnswers = Object.keys(gradingDetails).length > 0
        ? Object.values(gradingDetails).filter((detail: GradingDetail) => detail.is_correct).length
        : 0; // Will be calculated from score if grading details are missing

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        if (percentage >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const getGradeLetter = (percentage: number) => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const getPerformanceMessage = (percentage: number) => {
        if (percentage >= 90) return 'Excellent work! You have mastered this material.';
        if (percentage >= 80) return 'Great job! You have a strong understanding of the material.';
        if (percentage >= 70) return 'Good work! You have a solid grasp of most concepts.';
        if (percentage >= 60) return 'You passed, but consider reviewing the material for better understanding.';
        return 'You may want to review the material and retake the assessment if possible.';
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const downloadResults = () => {
        // This would generate a PDF or export results
        console.log('Downloading results...');
    };

    const shareResults = () => {
        // This would share results (if allowed)
        console.log('Sharing results...');
    };

    return (
        <div className="container mx-auto max-w-4xl space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={module ? `/courses/${course.id}/modules/${module.id}` : `/courses/${course.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {module ? 'Back to Module' : 'Back to Course'}
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">{assessment.title} - Results</h1>
                    <p className="text-muted-foreground">{course.title ?? ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        <Award className="mr-2 h-4 w-4" />
                        {getGradeLetter(percentage)}
                    </Badge>
                </div>
            </div>

            {/* Performance Alert */}
            <Alert className={`border-l-4 ${
                percentage >= 70 ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'
            }`}>
                <Info className="h-4 w-4" />
                <AlertDescription className="font-medium">
                    {getPerformanceMessage(percentage)}
                </AlertDescription>
            </Alert>

            {/* Score Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Score Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className={`text-6xl font-bold ${getGradeColor(percentage)}`}>
                            {percentage.toFixed(1)}%
                        </div>
                        <div className="text-xl text-muted-foreground mt-2">
                            {score} out of {maxScore} points
                        </div>
                    </div>

                    <Progress value={percentage} className="h-3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-semibold">{score}</div>
                            <div className="text-sm text-muted-foreground">Points Earned</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-semibold">{maxScore}</div>
                            <div className="text-sm text-muted-foreground">Total Points</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-semibold">{correctAnswers}/{questionsCount}</div>
                            <div className="text-sm text-muted-foreground">Correct Answers</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-semibold">{formatTime(timeSpent)}</div>
                            <div className="text-sm text-muted-foreground">Time Spent</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Results */}
            {Object.keys(gradingDetails).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Question-by-Question Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.values(gradingDetails).map((detail: GradingDetail, index: number) => (
                            <div key={detail.question_id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium flex items-center gap-2">
                                            Question {index + 1}
                                            {detail.is_correct ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {detail.question_text}
                                        </p>
                                    </div>
                                    <Badge variant={detail.is_correct ? 'default' : 'destructive'} className="ml-4">
                                        {detail.score}/{detail.max_score} pts
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-foreground">Your Answer:</span>
                                        <div className={`mt-1 p-3 rounded border ${
                                            detail.is_correct
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
                                        }`}>
                                            {(() => {
                                                if (detail.user_answer === null || detail.user_answer === undefined || detail.user_answer === '') {
                                                    return 'No answer provided';
                                                }

                                                const question = assessment.questions?.find(q => q.id.toString() === detail.question_id.toString());
                                                if (question && question.type === 'MCQ' && question.choices) {
                                                    const answerKey = detail.user_answer.toString();
                                                    const choices = Object.values(question.choices);
                                                    const choiceIndex = parseInt(answerKey);
                                                    if (!isNaN(choiceIndex) && choices[choiceIndex]) {
                                                        return `(${answerKey}) ${choices[choiceIndex]}`;
                                                    }
                                                }
                                                return detail.user_answer;
                                            })()}
                                        </div>
                                    </div>
                                    {detail.correct_answer !== null && detail.correct_answer !== undefined && detail.correct_answer !== '' && (
                                        <div>
                                            <span className="font-medium text-foreground">Correct Answer:</span>
                                            <div className="mt-1 p-3 rounded border bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
                                                {(() => {
                                                    const question = assessment.questions?.find(q => q.id.toString() === detail.question_id.toString());
                                                    if (question && question.type === 'MCQ' && question.choices) {
                                                        // For MCQ, the correct answer is now stored as choice key (e.g., "0")
                                                        const correctAnswerKey = detail.correct_answer ? detail.correct_answer.toString() : '';
                                                        const choices = Object.values(question.choices);
                                                        const choiceIndex = parseInt(correctAnswerKey);
                                                        if (!isNaN(choiceIndex) && choices[choiceIndex]) {
                                                            return `(${correctAnswerKey}) ${choices[choiceIndex]}`;
                                                        }
                                                        // Fallback: return the correct answer as is
                                                        return correctAnswerKey;
                                                    }
                                                    return detail.correct_answer;
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {detail.feedback && (
                                    <div className="text-sm p-3 rounded border bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                                        <span className="font-medium text-blue-800 dark:text-blue-200">Feedback:</span>
                                        <p className="mt-1 text-blue-700 dark:text-blue-100">{detail.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Assessment Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Assessment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Submitted:</span>
                            <p className="text-muted-foreground">
                                {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Time Limit:</span>
                            <p className="text-muted-foreground">
                                {assessment.time_limit ? `${assessment.time_limit} minutes` : 'No time limit'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Questions:</span>
                            <p className="text-muted-foreground">
                                {questionsCount || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium">Graded:</span>
                            <p className="text-muted-foreground">
                                {submission.graded_at ? new Date(submission.graded_at).toLocaleString() : 'Auto-graded'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" asChild>
                    <Link href={module ? `/courses/${course.id}/modules/${module.id}` : `/courses/${course.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {module ? 'Back to Module' : 'Back to Course'}
                    </Link>
                </Button>
                {assessment.show_results && (
                    <Button variant="outline" asChild>
                        <Link href={`/courses/${course.id}/assessments/${assessment.id}/take`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Assessment
                        </Link>
                    </Button>
                )}
                <Button variant="outline" onClick={downloadResults}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                </Button>
                {assessment.allow_result_sharing && (
                    <Button variant="outline" onClick={shareResults}>
                        <Share className="mr-2 h-4 w-4" />
                        Share Results
                    </Button>
                )}
            </div>
        </div>
    );
}
