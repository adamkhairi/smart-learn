import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleProgress } from '@/components/module-progress';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseShowPageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Award,
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
    BarChart3,
} from 'lucide-react';

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
        setExpandedAssignments((prev) =>
            prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId]
        );
    };

    const isAssignmentExpanded = (assignmentId: number) => expandedAssignments.includes(assignmentId);

    // Filter content based on user role
    const publishedModules = course.modules?.filter((module) => module.is_published) || [];

    // Students should only see published content
    const visibleModules = isStudent ? publishedModules : course.modules || [];
    const visibleAssignments = course.assignments || [];
    const visibleDiscussions = course.discussions || [];

    // Course deletion would be handled by the parent component

    const getStatusBadge = (status: string) => {
        return status === 'published' ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Published
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                Archived
            </Badge>
        );
    };

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
                                        <Button asChild>
                                            <Link href={`/courses/${course.id}/modules/create`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Module
                                            </Link>
                                        </Button>
                                    </>
                                )}
                        </div>
                        )}
                </div>

                {/* Main Course Info Card (Image, Title, Status, Creator, Description) */}
                <Card className="flex flex-col overflow-hidden">
                    {/* Course Image Banner */}
                    {course.image && (
                        <div className="w-full">
                            <AspectRatio ratio={16 / 9}>
                                <img
                                    src={`/storage/${course.image}`}
                                    alt={course.name}
                                    className="h-full w-full object-cover"
                                />
                            </AspectRatio>
                        </div>
                    )}
                    <CardHeader className="flex-1">
                        <div className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                                    {course.name}
                                </CardTitle>
                                {getStatusBadge(course.status)}
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
                                        <p className="text-lg font-bold sm:text-2xl">
                                            {course.enrolled_users?.length || 0}
                                        </p>
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
                                        <p className="text-lg font-bold sm:text-2xl">
                                            {course.assignments?.length || 0}
                                        </p>
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
                                        <p className="text-lg font-bold sm:text-2xl">
                                            {course.discussions?.length || 0}
                                        </p>
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
                                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {course.description}
                                    </p>
                                ) : (
                                    <p className="text-sm italic text-muted-foreground sm:text-base">No description provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Access to Modules */}
                        {visibleModules.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Modules
                                        </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {visibleModules.map((module) => (
                                        <Link
                                            key={module.id}
                                            href={route('courses.modules.show', [
                                                course.id,
                                                module.id,
                                            ])}
                                            className="block rounded-md p-3 transition-colors hover:bg-muted"
                                        >
                                            <h3 className="font-semibold">{module.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {module.description || 'No description provided.'}
                                            </p>
                                                                </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

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
                                    <CardContent className="grid gap-4">
                                        {visibleModules.length > 0 ? (
                                            <ModuleProgress
                                                course={course}
                                                userEnrollment={userEnrollment}
                                                modules={visibleModules}
                                            />
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground sm:text-base">
                                                No modules available.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="assignments" className="mt-4">
                                <Card>
                                    <CardContent className="grid gap-4">
                                        {visibleAssignments.length > 0 ? (
                                            <div>
                                                {visibleAssignments.map((assignment) => (
                                                    <Card key={assignment.id} className="mb-4">
                                                        <CardHeader className="pb-3 sm:pb-4">
                                                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                                                {assignment.title}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className={isAssignmentExpanded(assignment.id) ? 'text-sm text-muted-foreground' : 'text-sm text-muted-foreground line-clamp-3'}>
                                                                {assignment.description || 'No description provided.'}
                                                            </p>
                                                            {assignment.description && assignment.description.length > 150 && (
                                                                <Button variant="link" onClick={() => toggleAssignmentExpansion(assignment.id)} className="px-0">
                                                                    {isAssignmentExpanded(assignment.id) ? 'Show Less' : 'Read More'}
                                                                </Button>
                                                            )}
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" /> Due:{' '}
                                                                    {assignment.due_date
                                                                        ? new Date(assignment.due_date).toLocaleDateString()
                                                                        : 'N/A'}
                                                                </span>
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground sm:text-base">
                                                No assignments available.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                                    </TabsContent>

                            {/* Discussions Tab */}
                            <TabsContent value="discussions" className="mt-4">
                                <Card>
                                    <CardHeader className="pb-3 sm:pb-4">
                                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Discussions
                                        </CardTitle>
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
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {discussion.content || 'No description provided.'}
                                                            </p>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground sm:text-base">
                                                No discussions available for this course.
                                            </p>
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
                                                            href={`/courses/${course.id}/assessments/${assessment.id}/take`}
                                                            className="block rounded-md p-3 transition-colors hover:bg-muted"
                                                        >
                                                            <h3 className="font-semibold">{assessment.title}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {(assessment.content_html || assessment.instructions_html) ?
                                                                    <div dangerouslySetInnerHTML={{ __html: (assessment.content_html || assessment.instructions_html) as string }} /> :
                                                                    'No description provided.'}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" /> Duration:{' '}
                                                                    {assessment.duration || 'N/A'} mins
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3" /> Max Score:{' '}
                                                                    {assessment.max_score || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground sm:text-base">
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
                                        <Link href={`/courses/${course.id}/enroll`}>Enroll Now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                        {/* Instructor Info Card */}
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
                                        As an instructor, you can manage course details, modules, assignments, and track
                                        student progress.
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
                                        <p className="text-muted-foreground">
                                            {new Date(course.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                    <ModuleProgress
                                        course={course}
                                        userEnrollment={userEnrollment}
                                        modules={publishedModules}
                                    />
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
