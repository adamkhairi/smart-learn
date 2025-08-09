import { CourseStatusBadge } from '@/components/course-status-badge';
import { ModuleProgress } from '@/components/module-progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseShowPageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    FileText,
    MessageSquare,
    MoreVertical,
    Plus,
    Star,
    Target,
    Users,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
    {
        title: 'Course Details',
        href: '#',
    },
];

function Show({ course, userEnrollment }: CourseShowPageProps) {
    const { canManageCourse } = useAuth();
    const isMobile = useIsMobile();
    const isInstructor = canManageCourse(course.created_by);
    const isStudent = userEnrollment?.enrolled_as === 'student';

    const [expandedAssignments, setExpandedAssignments] = useState<number[]>([]);

    const toggleAssignmentExpansion = (assignmentId: number) => {
        setExpandedAssignments((prev) => (prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId]));
    };

    const isAssignmentExpanded = (assignmentId: number) => expandedAssignments.includes(assignmentId);

    // Filter content based on user role
    const publishedModules = course.modules?.filter((module) => module.is_published) || [];

    // Students should only see published content
    const visibleModules = isStudent ? publishedModules : course.modules || [];
    const visibleAssignments = course.assignments || [];
    const visibleDiscussions = course.discussions || [];

    // Course deletion would be handled by the parent component

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.name} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
                {/* Top Header Row: Back Button and Action Buttons */}
                <div className="flex items-center justify-between">
                    {/* Back Button */}
                    <Button variant="ghost" size={isMobile ? 'sm' : 'default'} asChild>
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Back to Courses</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                    </Button>

                    {/* Action Buttons (Edit Course, Add Module) */}
                    {isInstructor && (
                        <div className="flex shrink-0 items-center gap-2">
                            {isMobile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/courses/${course.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Course
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/courses/${course.id}/modules/create`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Module
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button variant="outline" asChild>
                                        <Link href={`/courses/${course.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Course
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('courses.progress.analytics', { course: course.id })}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Analytics
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href={`/admin/courses/${course.id}/enrollments`}>
                                            <Users className="mr-2 h-4 w-4" />
                                            Manage Enrollments
                                        </Link>
                                    </Button>
                                    {/* Go to Modules Button (Always visible) */}
                                    <Button variant="outline" size={isMobile ? 'sm' : 'default'} asChild>
                                        <Link href={`/courses/${course.id}/modules`}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            <span className="hidden sm:inline">Go to Modules</span>
                                            <span className="sm:hidden">Modules</span>
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/courses/${course.id}/modules/create`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Module
                                        </Link>
                                    </Button>{' '}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Course Info Card (Image, Title, Status, Creator, Description) */}
                <Card className="flex flex-col overflow-hidden">
                    {/* Course Image Banner */}
                    {course.image && (
                        <div className="mb-4 h-56 w-full overflow-hidden">
                            <AspectRatio ratio={16 / 9}>
                                <img src={`/storage/${course.image}`} alt={course.name} className="h-full w-full object-cover" />
                            </AspectRatio>
                        </div>
                    )}
                    <CardHeader>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{course.name}</CardTitle>
                                <CourseStatusBadge status={course.status} />
                            </div>
                            <CardDescription className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                                Created by {course.creator?.name} • {new Date(course.created_at).toLocaleDateString()}
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                {/* Course Stats Overview - Responsive Grid */}
                {!isStudent && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2 dark:bg-blue-900">
                                        <Users className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Students</p>
                                        <p className="text-lg font-bold sm:text-2xl">{course.enrolled_users?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="rounded-lg bg-green-100 p-1.5 sm:p-2 dark:bg-green-900">
                                        <BookOpen className="h-4 w-4 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Modules</p>
                                        <p className="text-lg font-bold sm:text-2xl">{visibleModules.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="rounded-lg bg-purple-100 p-1.5 sm:p-2 dark:bg-purple-900">
                                        <FileText className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5 dark:text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Assignments</p>
                                        <p className="text-lg font-bold sm:text-2xl">{course.assignments?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="rounded-lg bg-orange-100 p-1.5 sm:p-2 dark:bg-orange-900">
                                        <MessageSquare className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5 dark:text-orange-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Discussions</p>
                                        <p className="text-lg font-bold sm:text-2xl">{course.discussions?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content - Responsive Layout */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                    {/* Main Content Area - Takes full width on mobile, 2/3 on desktop */}
                    <div className="space-y-4 lg:col-span-2 lg:space-y-6">
                        {/* Course Description */}
                        <Card>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Course Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {course.description ? (
                                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{course.description}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic sm:text-base">No description provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tabs for Course Content (Modules, Assignments, Discussions, Assessments) */}
                        <Tabs defaultValue="modules" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="modules">Modules</TabsTrigger>
                                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                            </TabsList>
                            <TabsContent value="modules" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Course Modules
                                            </CardTitle>
                                            {isInstructor && (
                                                <Button size="sm" asChild>
                                                    <Link href={route('courses.modules.create', { course: course.id })}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Module
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {visibleModules.length > 0 ? (
                                            <>
                                                {visibleModules.map((module) => (
                                                    <Link
                                                        key={module.id}
                                                        href={route('courses.modules.show', [course.id, module.id])}
                                                        className="block rounded-md p-3 transition-colors hover:bg-muted"
                                                    >
                                                        <h3 className="font-semibold">{module.title}</h3>
                                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                                            {module.description || 'No description provided.'}
                                                        </p>
                                                    </Link>
                                                ))}
                                                <div className="flex justify-center pt-4">
                                                    <Button asChild variant="outline">
                                                        <Link href={route('courses.modules.index', { course: course.id })}>
                                                            View All Modules
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic sm:text-base">No modules available.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="assignments" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Assignments
                                            </CardTitle>
                                            {isInstructor && (
                                                <Button size="sm" variant="outline">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Assignment
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {visibleAssignments.length > 0 ? (
                                            <>
                                                {visibleAssignments.map((assignment) => (
                                                    <Link
                                                        key={assignment.id}
                                                        href={route('assignments.show', [course.id, assignment.id])}
                                                        className="block rounded-md border p-4 transition-colors hover:bg-muted"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-semibold flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                                    {assignment.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    {assignment.total_points && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Star className="h-3 w-3" />
                                                                            {assignment.total_points} pts
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                                {assignment.description || 'No description provided.'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                                <div className="flex justify-center pt-4">
                                                    <Button asChild variant="outline">
                                                        <Link href={`/courses/${course.id}/assignments`}>
                                                            View All Assignments
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                <p className="mb-4 text-sm text-muted-foreground italic sm:text-base">
                                                    No assignments available for this course.
                                                </p>
                                                {isInstructor && (
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Assignment
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Discussions Tab */}
                            <TabsContent value="discussions" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Discussions
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                {visibleDiscussions.length > 0 && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('courses.discussions.index', { course: course.id })}>View All</Link>
                                                    </Button>
                                                )}
                                                <Button size="sm" asChild>
                                                    <Link href={route('courses.discussions.index', { course: course.id })}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Start Discussion
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {visibleDiscussions.length > 0 ? (
                                            <ul className="grid gap-3">
                                                {visibleDiscussions.map((discussion) => (
                                                    <li key={discussion.id}>
                                                        <Link
                                                            href={`/courses/${course.id}/discussions/${discussion.id}`}
                                                            className="block rounded-md p-3 transition-colors hover:bg-muted"
                                                        >
                                                            <h3 className="font-semibold">{discussion.title}</h3>
                                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                                {discussion.content || 'No description provided.'}
                                                            </p>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                                <p className="mb-4 text-sm text-muted-foreground italic sm:text-base">
                                                    No discussions available for this course.
                                                </p>
                                                <Button asChild>
                                                    <Link href={route('courses.discussions.index', { course: course.id })}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Start First Discussion
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Assessments Tab */}
                            <TabsContent value="assessments" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Assessments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4">
                                        {course.assessments && course.assessments.length > 0 ? (
                                            <ul className="grid gap-3">
                                                {course.assessments.map((assessment) => (
                                                    <li key={assessment.id}>
                                                        <Link
                                                            href={route('assessments.take', { course: course.id, assessment: assessment.id })}
                                                            className="block rounded-md p-3 transition-colors hover:bg-muted"
                                                        >
                                                            <h3 className="font-semibold">{assessment.title}</h3>
                                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                                {assessment.content_html || assessment.instructions_html ? (
                                                                    <div
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: (assessment.content_html ||
                                                                                assessment.instructions_html) as string,
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    'No description provided.'
                                                                )}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" /> Duration: {assessment.duration || 'N/A'} mins
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3" /> Max Score: {assessment.max_score || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic sm:text-base">
                                                No assessments available for this course.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Enrollment Section for Students */}
                        {!isInstructor && !userEnrollment && (
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                        Enroll in this Course
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Unlock all course content, track your progress, and participate in discussions.
                                    </p>
                                    <Button asChild>
                                        <Link href={route('courses.enroll', { course: course.id })}>Enroll Now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar/Right Column - Takes 1/3 on desktop, full width on mobile */}
                    <div className="space-y-4 lg:col-span-1 lg:space-y-6">
                        {/* Course Overview/Details */}
                        <Card>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Course Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div className="flex items-center">
                                    <Users className="mr-3 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Category:</p>
                                        <p className="text-muted-foreground">{course.category?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Star className="mr-3 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Level:</p>
                                        <p className="text-muted-foreground">{course.level || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-3 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Estimated Duration:</p>
                                        <p className="text-muted-foreground">{course.duration || 'N/A'} hours</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Last Updated:</p>
                                        <p className="text-muted-foreground">{new Date(course.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructor Info Card (moved) */}
                        {isInstructor && (
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <Bell className="h-5 w-5" />
                                        Course Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-3 text-sm">
                                    <p className="text-muted-foreground">
                                        As an instructor, you can manage course details, modules, assignments, and track student progress.
                                    </p>
                                    <Button variant="outline" asChild>
                                        <Link href={route('admin.courses.analytics', { course: course.id })}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            View Course Analytics
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Enrollment/Progress Card */}
                        {isStudent && userEnrollment && (
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Your Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ModuleProgress course={course} userEnrollment={userEnrollment} modules={publishedModules} />
                                    <Button variant="outline" className="mt-4 w-full" asChild>
                                        <Link href={route('progress.show', { course: course.id })}>View Detailed Progress</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
