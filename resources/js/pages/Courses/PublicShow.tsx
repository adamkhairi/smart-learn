import AppLayout from '@/layouts/app-layout';
import PublicLayout from '@/layouts/public-layout';
import { BreadcrumbItem, Course } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CourseStatusBadge } from '@/components/course-status-badge';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

interface PublicShowProps {
    course: Course;
    hasPendingEnrollmentRequest: boolean;
    canAccessFullCourse: boolean; // New prop from backend
}

const breadcrumbs = (courseName: string): BreadcrumbItem[] => [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: courseName,
        href: '#',
    },
];

export default function PublicShow({ course, hasPendingEnrollmentRequest, canAccessFullCourse }: PublicShowProps) {
    const { isAuthenticated } = useAuth();
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

    const { post, processing } = useForm({});

    // Redirect to full course view if user can access it
    useEffect(() => {
        if (canAccessFullCourse) {
            // Use Inertia.visit for client-side navigation
            router.visit(route('courses.show', course.id), { replace: true });
        }
    }, [canAccessFullCourse, course.id]);

    if (!course) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Course Not Found" />
                <div className=" px-4 py-6 text-center text-muted-foreground">
                    Course not found or inaccessible.
                </div>
            </AppLayout>
        );
    }

    const LayoutComponent = isAuthenticated ? AppLayout : PublicLayout;

    const handleEnrollRequest = () => {
        post(route('courses.enrollment_request', course.id), {
            onSuccess: () => {
                setIsEnrollDialogOpen(false);
            },
            onError: () => {
                // No error handling needed since we're using the default error handling
            },
        });
    };

    return (
        <LayoutComponent breadcrumbs={breadcrumbs(course.name)}>
            <Head title={course.name} />
            <div className=" py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href={route('courses.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                </div>

                {course && course.name ? (
                    <Card>
                        {course.image ? (
                            <div
                                className="w-full h-56 mb-4 overflow-hidden"
                                style={course.background_color ? { backgroundColor: course.background_color } : {}}
                            >
                                <AspectRatio ratio={16 / 9}>
                                    <img
                                        src={`/storage/${course.image}`}
                                        alt={course.name}
                                        className="h-full w-full object-cover"
                                    />
                                </AspectRatio>
                            </div>
                        ) : (
                            <div
                                className="w-full h-56 mb-4 overflow-hidden rounded-t-lg flex items-center justify-center"
                                style={course.background_color ? { backgroundColor: course.background_color } : {}}
                            >
                                <span className="text-white text-4xl font-bold">
                                    {course.name ? course.name.charAt(0).toUpperCase() : ''}
                                </span>
                            </div>
                        )}
                        <CardHeader className="pb-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-3xl font-bold">{course.name}</CardTitle>
                                        <CourseStatusBadge status={course.status} />
                                    </div>
                                    <CardDescription className="mt-2">
                                        Created by {course.creator?.name} on {new Date(course.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </div>

                                {/* Enrollment Action/Status in Header */}
                                <div>
                                    {hasPendingEnrollmentRequest ? (
                                        <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Request Pending</span>
                                        </div>
                                    ) : isAuthenticated ? (
                                        <Button
                                            onClick={() => setIsEnrollDialogOpen(true)}
                                            className="w-full md:w-auto"
                                            size="sm"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Request to Enroll
                                        </Button>
                                    ) : (
                                        <Link href={route('login')}><Button size="sm">Log In to Enroll</Button></Link>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {course.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Key Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Category:</p>
                                        <p className="text-muted-foreground">{course.category?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Level:</p>
                                        <p className="text-muted-foreground">{course.level || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Duration:</p>
                                        <p className="text-muted-foreground">{course.duration ? `${course.duration} hours` : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* New section to trigger enrollment dialog */}
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-xl font-semibold mb-4">Course Content</h3>
                                <p className="text-muted-foreground mb-4">To access the full course content, including modules, lectures, assignments, and assessments, please enroll in the course.</p>
                                <Button onClick={() => setIsEnrollDialogOpen(true)} className="w-full md:w-auto">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Enroll to View Content
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center text-muted-foreground">
                        Course details currently unavailable.
                    </div>
                )}

                {/* Enrollment Dialog */}
                <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enroll in {course.name}</DialogTitle>
                            <DialogDescription>
                                {isAuthenticated
                                    ? 'Send a request to enroll in this course. You will be notified once it\'s approved.'
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-center">
                            {isAuthenticated ? (
                                <Button onClick={handleEnrollRequest} disabled={processing} className="w-full">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {processing ? 'Sending Request...' : 'Send Enrollment Request'}
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-muted-foreground">You need to be logged in to request enrollment.</p>
                                    <div className="flex gap-4">
                                        <Link href={route('login')}><Button variant="outline">Log In</Button></Link>
                                        <Link href={route('register')}><Button>Register</Button></Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </LayoutComponent>
    );
}
