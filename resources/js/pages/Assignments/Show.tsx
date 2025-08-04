import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { Assignment, Course, BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Users,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    Star,
    Edit,
    Eye,
    BarChart3,
    BookOpen,
} from 'lucide-react';

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

interface AssignmentShowPageProps {
    course: Course;
    assignment: Assignment;
    userSubmission?: UserSubmission | null;
    submissionCount?: number;
}



function Show({ course, assignment, userSubmission, submissionCount = 0 }: AssignmentShowPageProps) {
    const { canManageCourse } = useAuth();
    const isInstructor = canManageCourse(course.created_by);
    const isOpen = assignment.status === 'open';
    const hasSubmitted = !!userSubmission;
    const isGraded = userSubmission?.score !== null && userSubmission?.score !== undefined;

    // Navigation items for breadcrumb
    const navigationItems = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: assignment.title, href: '#', isActive: true },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = () => {
        if (isInstructor) {
            return (
                <Badge variant={isOpen ? 'default' : 'secondary'}>
                    {isOpen ? 'Open' : 'Closed'}
                </Badge>
            );
        }

        if (!isOpen) {
            return <Badge variant="destructive">Closed</Badge>;
        }

        if (isGraded) {
            return <Badge variant="default" className="bg-green-500">Graded</Badge>;
        }

        if (hasSubmitted) {
            return <Badge variant="secondary">Submitted</Badge>;
        }

        return <Badge variant="outline">Not Submitted</Badge>;
    };

    return (
        <AppLayout breadcrumbs={navigationItems}>
            <Head title={`${assignment.title} - ${course.name}`} />

            <div className="px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" asChild>
                            <Link href={`/courses/${course.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            {getStatusBadge()}
                            {isInstructor && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/courses/${course.id}/assignments/${assignment.id}/submissions`}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            View Submissions
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Assignment
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Assignment Title and Meta */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Due: {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {assignment.total_points || 0} points
                                    </span>
                                    {isInstructor && (
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Main Content Area */}
                    <div className="space-y-6 lg:col-span-3">

                        {/* Assignment Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Assignment Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    {assignment.description ? (
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {assignment.description}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground italic">No description provided.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Student Submission Section */}
                        {!isInstructor && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload className="h-5 w-5" />
                                        Your Submission
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {hasSubmitted ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                Submitted on {formatDate(userSubmission.submitted_at)}
                                            </div>

                                            {/* Submitted Files */}
                                            {(userSubmission.files?.length || userSubmission.file_path) && (
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Submitted Files:</h4>
                                                    <div className="space-y-2">
                                                        {userSubmission.files?.map((file: any, index: number) => (
                                                            <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm">{file.original_name || `File ${index + 1}`}</span>
                                                                <Button variant="ghost" size="sm" className="ml-auto">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )) || (userSubmission.file_path && (
                                                            <div className="flex items-center gap-2 rounded-md border p-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm">{userSubmission.original_filename || 'Submitted File'}</span>
                                                                <Button variant="ghost" size="sm" className="ml-auto">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grade and Feedback */}
                                            {isGraded && (
                                                <div className="space-y-2">
                                                    <Separator />
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Grade & Feedback</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="default" className="bg-green-500">
                                                                Score: {userSubmission.score}/{assignment.total_points || 0}
                                                            </Badge>
                                                        </div>
                                                        {userSubmission.feedback && (
                                                            <div className="rounded-md bg-muted p-3">
                                                                <p className="text-sm">{userSubmission.feedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resubmit if allowed */}
                                            {isOpen && (
                                                <Button asChild>
                                                    <Link href={route('assignments.submit.form', [course.id, assignment.id])}>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Resubmit Assignment
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {isOpen ? (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <AlertCircle className="h-4 w-4" />
                                                        You haven't submitted this assignment yet.
                                                    </div>
                                                    <Button asChild>
                                                        <Link href={route('assignments.submit.form', [course.id, assignment.id])}>
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Submit Assignment
                                                        </Link>
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    This assignment is closed and no longer accepts submissions.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Instructor Management Section */}
                        {isInstructor && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Assignment Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{submissionCount}</div>
                                            <div className="text-sm text-muted-foreground">Total Submissions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{assignment.total_points || 0}</div>
                                            <div className="text-sm text-muted-foreground">Max Points</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{isOpen ? 'Open' : 'Closed'}</div>
                                            <div className="text-sm text-muted-foreground">Status</div>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href={`/courses/${course.id}/assignments/${assignment.id}/submissions`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View All Submissions
                                            </Link>
                                        </Button>
                                        <Button variant="outline">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Assignment
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Assignment Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                                            <div className="mt-1">{getStatusBadge()}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                                            <div className="mt-1 text-sm">
                                                {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Points</div>
                                            <div className="mt-1 text-sm">{assignment.total_points || 0} points</div>
                                        </div>
                                        {isInstructor && (
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">Submissions</div>
                                                <div className="mt-1 text-sm">{submissionCount} submitted</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
