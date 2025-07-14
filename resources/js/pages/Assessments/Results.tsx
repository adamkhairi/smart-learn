import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssessmentScoreBadge } from '@/components/assessment-score-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Course, Assessment, Submission } from '@/types';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AssessmentResultsProps {
    course: Course;
    assessment: Assessment & {
        questions: Array<{
            id: number;
            question_number: number;
            type: 'MCQ' | 'Essay' | 'TrueFalse';
            question_text: string;
            points: number;
            choices?: Record<string, string>;
            keywords?: string[];
        }>;
    };
    submission: Submission;
}

export default function AssessmentResults({ course, assessment, submission }: AssessmentResultsProps) {
    const score = submission.score || 0;
    const maxScore = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const answers = (submission.answers as Record<number, string>) || {};

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{assessment.title} - Results</h1>
                <p className="text-muted-foreground">Course: {course.name}</p>
            </div>

            {/* Score Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Assessment Results</span>
                        <AssessmentScoreBadge percentage={percentage} />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                                {score}/{maxScore}
                            </div>
                            <p className="text-muted-foreground">Total Score</p>
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor(percentage)}`}>
                                {Math.round(percentage)}%
                            </div>
                            <p className="text-muted-foreground">Percentage</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-600">
                                {assessment.questions.length}
                            </div>
                            <p className="text-muted-foreground">Questions</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Score Progress</span>
                            <span>{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                    </div>

                    <div className="flex items-center justify-center">
                        <Award className="h-8 w-8 text-yellow-500 mr-2" />
                        <span className="text-lg font-medium">
                            {percentage >= 90 ? 'Outstanding Performance!' :
                             percentage >= 80 ? 'Great Job!' :
                             percentage >= 70 ? 'Good Work!' :
                             'Keep Practicing!'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Question Review */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {assessment.questions.map((question) => {
                        const userAnswer = answers[question.id] || '';
                        const isCorrect = question.type === 'MCQ' || question.type === 'TrueFalse'
                            ? userAnswer === question.answer
                            : null; // Essay questions can't be auto-graded for correctness

                        return (
                            <div key={question.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-medium">Question {question.question_number}</span>
                                            <Badge variant="outline">{question.points} points</Badge>
                                            {isCorrect !== null && (
                                                isCorrect ?
                                                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <p className="text-gray-700">{question.question_text}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="font-medium text-sm text-gray-600">Your Answer:</div>
                                    {question.type === 'MCQ' && question.choices && (
                                        <div className="pl-4">
                                            <span className="text-gray-700">
                                                {question.choices?.[userAnswer] || 'No answer provided'}
                                            </span>
                                        </div>
                                    )}
                                    {question.type === 'TrueFalse' && (
                                        <div className="pl-4">
                                            <span className="text-gray-700">
                                                {userAnswer === 'true' ? 'True' : userAnswer === 'false' ? 'False' : 'No answer provided'}
                                            </span>
                                        </div>
                                    )}
                                    {question.type === 'Essay' && (
                                        <div className="pl-4">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {userAnswer || 'No answer provided'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {question.type === 'MCQ' && question.choices && (
                                    <div className="space-y-2">
                                        <div className="font-medium text-sm text-gray-600">Correct Answer:</div>
                                        <div className="pl-4">
                                            <span className="text-green-700 font-medium">
                                                {question.choices?.[question.answer || ''] || question.answer || ''}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {question.type === 'TrueFalse' && (
                                    <div className="space-y-2">
                                        <div className="font-medium text-sm text-gray-600">Correct Answer:</div>
                                        <div className="pl-4">
                                            <span className="text-green-700 font-medium">
                                                {question.answer === 'true' ? 'True' : 'False'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {question.type === 'Essay' && question.keywords && (
                                    <div className="space-y-2">
                                        <div className="font-medium text-sm text-gray-600">Keywords to include:</div>
                                        <div className="pl-4">
                                            <div className="flex flex-wrap gap-1">
                                                {question.keywords.map((keyword, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                    <Link href={`/courses/${course.id}`}>
                        Back to Course
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={`/courses/${course.id}/modules`}>
                        View All Modules
                    </Link>
                </Button>
            </div>
        </div>
    );
}
