import React from 'react';
import { Head } from '@inertiajs/react';
import { ProgressCard } from '@/components/ProgressCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Course, ProgressSummary, ProgressRecord } from '@/types/progress';
import { BreadcrumbItem } from '@/types';

interface CourseProgressPageProps {
    course: Course;
    progress: ProgressSummary;
    progressRecords: ProgressRecord[];
}

const breadcrumbs = (
    courseName: string,
    courseId: number
): BreadcrumbItem[] => [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: courseName,
        href: `/courses/${courseId}`,
    },
    {
        title: 'Progress',
        href: '#',
    },
];

export default function Show({ course, progress, progressRecords }: CourseProgressPageProps) {
    const formatTimeSpent = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'in_progress':
                return <PlayCircle className="h-4 w-4 text-blue-600" />;
            case 'not_started':
                return <XCircle className="h-4 w-4 text-gray-400" />;
            default:
                return <XCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'not_started':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in_progress':
                return 'In Progress';
            case 'not_started':
                return 'Not Started';
            default:
                return 'Not Started';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(course.name, course.id)}>
            <Head title={`${course.name} - Progress`} />

            <div className=" px-4 py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/courses/${course.id}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course
                    </Button>

                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <p className="text-muted-foreground mt-2">Your learning progress</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Progress Overview */}
                    <div className="lg:col-span-2">
                        <ProgressCard
                            title="Course Progress"
                            progress={progress}
                            className="mb-6"
                        />

                        {/* Progress Records */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progressRecords.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <PlayCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                        <p>No learning activity yet</p>
                                        <p className="text-sm">Start exploring the course content to see your progress here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {progressRecords.map((record) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(record.status)}
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {record.course_module_item?.title || 'Unknown Item'}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.course_module?.title || 'Unknown Module'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {record.time_spent_seconds > 0 && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{formatTimeSpent(record.time_spent_seconds)}</span>
                                                        </div>
                                                    )}

                                                    {record.score !== undefined && record.max_score !== undefined && (
                                                        <div className="text-sm">
                                                            <span className="font-medium">{record.score}</span>
                                                            <span className="text-muted-foreground">/{record.max_score}</span>
                                                        </div>
                                                    )}

                                                    <Badge variant="secondary" className={getStatusColor(record.status)}>
                                                        {getStatusText(record.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium">Instructor</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {course.creator?.name || 'Unknown'}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium">Status</h4>
                                    <Badge variant="secondary" className="mt-1">
                                        {course.status}
                                    </Badge>
                                </div>

                                {course.description && (
                                    <div>
                                        <h4 className="font-medium">Description</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {course.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {course.modules?.length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Modules</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {progress.completed_items}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Completed Items</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
