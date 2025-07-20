import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Assessment, Assignment, Course, Submission } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, Award, CheckCircle2, Clock, FileText } from 'lucide-react';

interface RecentSubmission extends Submission {
    assignment?: Assignment;
    assessment?: Assessment;
    course: Course;
}

interface RecentSubmissionsProps {
    submissions: RecentSubmission[];
    title?: string;
    description?: string;
    maxDisplay?: number;
    showScore?: boolean;
    showCourse?: boolean;
    className?: string;
    emptyState?: {
        title?: string;
        description?: string;
        actionText?: string;
        actionHref?: string;
    };
}

export default function RecentSubmissions({
    submissions,
    title = 'Recent Submissions',
    description,
    maxDisplay,
    showScore = true,
    showCourse = true,
    className = '',
    emptyState = {
        title: 'No submissions yet',
        description: 'Complete assignments and assessments to see your submission history here.',
        actionText: 'Browse Courses',
        actionHref: '/courses',
    },
}: RecentSubmissionsProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const submitted = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Less than an hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInHours < 48) return 'Yesterday';

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return formatDate(dateString);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (score >= 80) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    };

    const getSubmissionIcon = (submission: RecentSubmission) => {
        if (submission.assignment) return FileText;
        if (submission.assessment) return Award;
        return FileText;
    };

    const getSubmissionTitle = (submission: RecentSubmission) => {
        return submission.assignment?.title || submission.assessment?.title || 'Unknown Item';
    };

    const getSubmissionType = (submission: RecentSubmission) => {
        if (submission.assignment) return 'Assignment';
        if (submission.assessment) return 'Assessment';
        return 'Submission';
    };

    const getSubmissionStatus = (submission: RecentSubmission) => {
        if (submission.score !== null) {
            return {
                label: 'Graded',
                icon: CheckCircle2,
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            };
        }

        return {
            label: 'Pending',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
    };

    const displaySubmissions = maxDisplay ? submissions.slice(0, maxDisplay) : submissions;

    if (submissions.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </CardHeader>
                <CardContent>
                    <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">{emptyState.title}</h3>
                        <p className="mx-auto mb-4 max-w-sm text-sm text-muted-foreground">{emptyState.description}</p>
                        {emptyState.actionHref && (
                            <Link href={emptyState.actionHref}>
                                <Button className="gap-2">
                                    {emptyState.actionText}
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                    </div>
                    {maxDisplay && submissions.length > maxDisplay && (
                        <Link href="/dashboard/submissions">
                            <Button variant="outline" size="sm" className="gap-2">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displaySubmissions.map((submission) => {
                        const SubmissionIcon = getSubmissionIcon(submission);
                        const status = getSubmissionStatus(submission);
                        const StatusIcon = status.icon;

                        return (
                            <div key={submission.id} className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                {/* Icon */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <SubmissionIcon className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="line-clamp-1 font-medium">{getSubmissionTitle(submission)}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{getSubmissionType(submission)}</span>
                                                {showCourse && submission.course && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="line-clamp-1">{submission.course.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="ml-2 flex items-center gap-2">
                                            <Badge variant="secondary" className={status.color}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                            {showScore && typeof submission.score === 'number' && (
                                                <Badge variant="secondary" className={getScoreColor(submission.score)}>
                                                    {submission.score}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Submitted {getTimeAgo(submission.submitted_at)}</span>

                                        {/* Action Link */}
                                        <Link
                                            href={`/submissions/${submission.id}`}
                                            className="flex items-center gap-1 font-medium text-primary hover:text-primary/80"
                                        >
                                            View Details
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Export types for external use
export type { RecentSubmission, RecentSubmissionsProps };
