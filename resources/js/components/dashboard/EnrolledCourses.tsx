import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from '@inertiajs/react';
import { BookOpen, Clock, User, ArrowRight, GraduationCap } from 'lucide-react';
import { Course, User as UserType, Category } from '@/types';

interface EnrolledCourse extends Course {
    creator: UserType;
    category: Category;
    progress?: {
        completed_items: number;
        total_items: number;
        percentage: number;
    };
    enrollment?: {
        enrolled_at: string;
        last_accessed?: string;
        status: 'active' | 'completed' | 'paused';
    };
}

interface EnrolledCoursesProps {
    courses: EnrolledCourse[];
    title?: string;
    description?: string;
    showProgress?: boolean;
    showInstructor?: boolean;
    maxDisplay?: number;
    className?: string;
    emptyState?: {
        title?: string;
        description?: string;
        actionText?: string;
        actionHref?: string;
    };
}

export default function EnrolledCourses({
    courses,
    title = "My Enrolled Courses",
    description,
    showProgress = true,
    showInstructor = true,
    maxDisplay,
    className = "",
    emptyState = {
        title: "No courses enrolled yet",
        description: "Start your learning journey by exploring our course catalog.",
        actionText: "Browse Courses",
        actionHref: "/courses"
    }
}: EnrolledCoursesProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'active':
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const displayCourses = maxDisplay ? courses.slice(0, maxDisplay) : courses;

    if (courses.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">{emptyState.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground max-w-sm mx-auto">
                            {emptyState.description}
                        </p>
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
                            <BookOpen className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                    </div>
                    {maxDisplay && courses.length > maxDisplay && (
                        <Link href="/dashboard/courses">
                            <Button variant="outline" size="sm" className="gap-2">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayCourses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                            {/* Course Thumbnail */}
                            <div
                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                                style={{ backgroundColor: course.background_color || '#3B82F6' }}
                            >
                                {getInitials(course.name)}
                            </div>

                            {/* Course Details */}
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium line-clamp-1">{course.name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {course.category && (
                                                <span>{course.category.name}</span>
                                            )}
                                            {showInstructor && course.creator && (
                                                <>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{course.creator.name}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {course.enrollment?.status && (
                                        <Badge
                                            variant="secondary"
                                            className={getStatusColor(course.enrollment.status)}
                                        >
                                            {course.enrollment.status === 'completed' ? (
                                                <GraduationCap className="h-3 w-3 mr-1" />
                                            ) : (
                                                <Clock className="h-3 w-3 mr-1" />
                                            )}
                                            {course.enrollment.status.charAt(0).toUpperCase() +
                                             course.enrollment.status.slice(1)}
                                        </Badge>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {showProgress && course.progress && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Progress: {course.progress.completed_items} of {course.progress.total_items} completed
                                            </span>
                                            <span className="font-medium">
                                                {course.progress.percentage}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={course.progress.percentage}
                                            className="h-2"
                                        />
                                    </div>
                                )}

                                {/* Enrollment Info */}
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        {course.enrollment?.enrolled_at && (
                                            <span>Enrolled {formatDate(course.enrollment.enrolled_at)}</span>
                                        )}
                                        {course.enrollment?.last_accessed && (
                                            <span> • Last accessed {formatDate(course.enrollment.last_accessed)}</span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Link href={`/courses/${course.id}`}>
                                        <Button size="sm" variant="ghost" className="gap-2 h-8 px-3">
                                            {course.enrollment?.status === 'completed' ? 'Review' : 'Continue'}
                                            <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Export types for external use
export type { EnrolledCourse, EnrolledCoursesProps };
