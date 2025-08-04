import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Submission } from '@/types';
import { CheckCircle, Clock, MessageSquare, Star, Calendar, User } from 'lucide-react';

interface GradingStatusProps {
    userSubmission?: Submission;
    itemType: 'assignment' | 'assessment';
    maxScore?: number;
}

export default function GradingStatus({ userSubmission, itemType, maxScore }: GradingStatusProps) {
    // Don't show anything if there's no submission
    if (!userSubmission) {
        return null;
    }

    const isGraded = userSubmission.graded_at && userSubmission.score !== null && userSubmission.score !== undefined;
    const hasScore = userSubmission.score !== null && userSubmission.score !== undefined;
    const hasFeedback = userSubmission.feedback && userSubmission.feedback.trim().length > 0;
    const hasGradingNotes = userSubmission.grading_notes && userSubmission.grading_notes.trim().length > 0;

    // Format the grading date
    const formatGradingDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate percentage and get score color
    const getScoreInfo = () => {
        if (!hasScore) return null;
        
        const score = userSubmission.score!;
        let percentage = 0;
        let scoreText = score.toString();
        
        if (maxScore && maxScore > 0) {
            percentage = Math.round((score / maxScore) * 100);
            scoreText = `${score}/${maxScore}`;
        }
        
        // Determine color based on percentage
        let colorClass = 'text-gray-600 dark:text-gray-400';
        let bgClass = 'bg-gray-50 dark:bg-gray-800/50';
        let borderClass = 'border-gray-200 dark:border-gray-700';
        
        if (percentage >= 90) {
            colorClass = 'text-green-700 dark:text-green-400';
            bgClass = 'bg-green-50 dark:bg-green-900/20';
            borderClass = 'border-green-200 dark:border-green-800';
        } else if (percentage >= 80) {
            colorClass = 'text-blue-700 dark:text-blue-400';
            bgClass = 'bg-blue-50 dark:bg-blue-900/20';
            borderClass = 'border-blue-200 dark:border-blue-800';
        } else if (percentage >= 70) {
            colorClass = 'text-yellow-700 dark:text-yellow-400';
            bgClass = 'bg-yellow-50 dark:bg-yellow-900/20';
            borderClass = 'border-yellow-200 dark:border-yellow-800';
        } else if (percentage > 0) {
            colorClass = 'text-red-700 dark:text-red-400';
            bgClass = 'bg-red-50 dark:bg-red-900/20';
            borderClass = 'border-red-200 dark:border-red-800';
        }
        
        return {
            scoreText,
            percentage,
            colorClass,
            bgClass,
            borderClass
        };
    };

    const scoreInfo = getScoreInfo();

    return (
        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isGraded ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {isGraded ? 'Graded' : 'Pending Review'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Submission
                            </p>
                        </div>
                    </div>
                    <Badge 
                        variant={isGraded ? "default" : "secondary"}
                        className={isGraded ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                    >
                        {isGraded ? "Completed" : "In Review"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
                {/* Submission Timeline */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Submitted</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {userSubmission.submitted_at && formatGradingDate(userSubmission.submitted_at)}
                            </p>
                        </div>
                    </div>
                    
                    {isGraded && userSubmission.graded_at && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Graded</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {formatGradingDate(userSubmission.graded_at)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Score Display */}
                {hasScore && scoreInfo && (
                    <div className={`rounded-lg border p-4 ${scoreInfo.bgClass} ${scoreInfo.borderClass}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Star className={`h-6 w-6 ${scoreInfo.colorClass}`} />
                                <div>
                                    <p className={`text-lg font-bold ${scoreInfo.colorClass}`}>
                                        {scoreInfo.scoreText}
                                        {scoreInfo.percentage > 0 && (
                                            <span className="ml-2 text-base font-medium">({scoreInfo.percentage}%)</span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Score</p>
                                </div>
                            </div>
                            {scoreInfo.percentage > 0 && (
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${scoreInfo.colorClass}`}>
                                        {scoreInfo.percentage >= 90 ? '🎉' : 
                                         scoreInfo.percentage >= 80 ? '👏' : 
                                         scoreInfo.percentage >= 70 ? '👍' : '📚'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Feedback Section */}
                {hasFeedback && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Instructor Feedback</h4>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {userSubmission.feedback}
                            </p>
                        </div>
                    </div>
                )}

                {/* Additional Notes */}
                {hasGradingNotes && userSubmission.grading_notes !== userSubmission.feedback && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Additional Notes</h4>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {userSubmission.grading_notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pending Status */}
                {!isGraded && !hasScore && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                    Awaiting Review
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    Your {itemType} has been submitted successfully and is waiting to be reviewed by your instructor. You'll receive a notification once it's graded.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
