import React, { useState, useEffect, useCallback } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Course, Assessment, Submission, CourseModule } from '@/types';
import { Clock, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';


interface TakeAssessmentProps {
    course: Course;
    assessment: Assessment & {
        questions: Array<{
            id: number;
            question_number: number;
            type: 'MCQ' | 'TrueFalse' | 'ShortAnswer';
            question_text: string;
            points: number;
            choices?: Record<string, string>;

        }>;
    };
    submission: Submission;
    module?: CourseModule;
    timeRemaining?: number;
}

export default function TakeAssessment({ course, assessment, submission, module, timeRemaining }: TakeAssessmentProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(timeRemaining || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    const { error: showError } = useToast();

    const { processing } = useForm({
        answers: {},
        time_spent: 0,
    });

    // Timer effect
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Auto-submit when time runs out
    const handleAutoSubmit = useCallback(() => {
        if (!isSubmitting) {
            setIsSubmitting(true);
            submitAssessment();
        }
    }, [isSubmitting]);

    // Check if already submitted
    if (submission && submission.finished) {
        // Redirect to results if already completed
        window.location.href = `/courses/${course.id}/assessments/${assessment.id}/results`;
        return null;
    }

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

        const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleQuestionNavigation = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (direction === 'next' && currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const submitAssessment = () => {
        const timeSpent = (timeRemaining || 0) - timeLeft;

        console.log('Submitting assessment with answers:', answers);
        console.log('Time spent:', timeSpent);

        // Check if we have any answers
        if (Object.keys(answers).length === 0) {
            showError('Please answer at least one question before submitting.');
            return;
        }

        // Use router to post the data
        router.post(`/courses/${course.id}/assessments/${assessment.id}/submit`, {
            answers,
            time_spent: timeSpent,
        }, {
            onSuccess: () => {
                // Backend will provide flash message, no need for manual toast
            },
            onError: (errors: Record<string, string>) => {
                console.error('Submission errors:', errors);
                showError('Failed to submit assessment. Please try again.');
            },
        });
    };

    const handleSubmit = () => {
        setShowConfirmSubmit(true);
    };

    const confirmSubmit = () => {
        setShowConfirmSubmit(false);
        submitAssessment();
    };

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
    const answeredQuestions = Object.keys(answers).length;
    const maxScore = assessment.questions.reduce((sum, q) => sum + q.points, 0); // Calculate max score

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-4">
                <Link href={module ? `/courses/${course.id}/modules/${module.id}` : `/courses/${course.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {module ? 'Back to Module' : 'Back to Course'}
                </Link>
            </Button>
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{assessment.title}</h1>
                    <p className="text-muted-foreground">Course: {course.name}</p>
                    <p className="text-sm text-muted-foreground">Total Points: {maxScore}</p>{/* Display max score */}
                </div>
                <div className="flex items-center gap-4">
                    {timeLeft > 0 && (
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                    <Badge variant="outline">
                        {answeredQuestions}/{assessment.questions.length} answered
                    </Badge>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Time Warning */}
            {timeLeft > 0 && timeLeft <= 300 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Less than 5 minutes remaining! Please submit your assessment soon.
                    </AlertDescription>
                </Alert>
            )}

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Question {currentQuestion.question_number}</span>
                        <Badge variant="secondary">{currentQuestion.points} points</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Question Text */}
                    <div className="prose max-w-none">
                        <p className="text-lg">{currentQuestion.question_text}</p>
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-4">
                        {currentQuestion.type === 'MCQ' && currentQuestion.choices && (
                            <div className="space-y-3">
                                {Object.entries(currentQuestion.choices).map(([key, value]) => (
                                    <label key={key} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`question_${currentQuestion.id}`}
                                            value={key}
                                            checked={answers[currentQuestion.id] === key}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                            className="h-4 w-4 text-primary"
                                        />
                                        <span>{value}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'TrueFalse' && (
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        value="true"
                                        checked={answers[currentQuestion.id] === 'true'}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <span>True</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        value="false"
                                        checked={answers[currentQuestion.id] === 'false'}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        className="h-4 w-4 text-primary"
                                    />
                                    <span>False</span>
                                </label>
                            </div>
                        )}

                        {currentQuestion.type === 'ShortAnswer' && (
                            <div>
                                <input
                                    type="text"
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    placeholder="Enter your answer here..."
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => handleQuestionNavigation('prev')}
                    disabled={currentQuestionIndex === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleQuestionNavigation('next')}
                        disabled={currentQuestionIndex === assessment.questions.length - 1}
                    >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={processing || isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing || isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                </div>
            </div>

            {/* Question Navigation */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {assessment.questions.map((question, index) => (
                            <Button
                                key={question.id}
                                variant={index === currentQuestionIndex ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentQuestionIndex(index)}
                                className="h-10"
                            >
                                {index + 1}
                                {answers[question.id] && (
                                    <CheckCircle className="ml-1 h-3 w-3" />
                                )}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Confirm Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Are you sure you want to submit your assessment? You cannot change your answers after submission.</p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={confirmSubmit} disabled={processing}>
                                    Submit Assessment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
