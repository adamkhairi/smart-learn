import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseShowPageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleProgress } from '@/components/module-progress';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Users, BookOpen, Calendar, Edit, Plus, FileText, MessageSquare, Bell, Clock, CheckCircle, Eye, ArrowRight, Star, Target, Award, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

    // Filter content based on user role
    const publishedModules = course.modules?.filter(module => module.is_published) || [];

    // Students should only see published content
    const visibleModules = isStudent ? publishedModules : (course.modules || []);
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
            <div className="flex h-full flex-1 flex-col gap-4 lg:gap-6 overflow-x-auto rounded-xl p-4 lg:p-6">
                {/* Enhanced Header - Mobile Optimized */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                                <Link href="/courses">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Courses</span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{course.name}</h1>
                                {getStatusBadge(course.status)}
                            </div>
                            <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                                Created by {course.creator?.name} • {new Date(course.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - Responsive */}
                    <div className="flex shrink-0 items-center gap-2">
                        {isInstructor && (
                            <>
                                {/* Mobile: Dropdown Menu */}
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
                                    /* Desktop: Individual Buttons */
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
                            </>
                        )}
                    </div>
                </div>

                {/* Course Stats Overview - Responsive Grid */}
                {!isStudent && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Students</p>
                                        <p className="text-lg sm:text-2xl font-bold">{course.enrolled_users?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Modules</p>
                                        <p className="text-lg sm:text-2xl font-bold">{visibleModules.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Assignments</p>
                                        <p className="text-lg sm:text-2xl font-bold">{course.assignments?.length || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Discussions</p>
                                        <p className="text-lg sm:text-2xl font-bold">{course.discussions?.length || 0}</p>
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
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{course.description}</p>
                                ) : (
                                    <p className="text-sm sm:text-base text-muted-foreground italic">No description provided.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Access to Modules */}
                        {visibleModules.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                            Course Modules
                                        </CardTitle>
                                        <Button variant="outline" size={isMobile ? "sm" : "default"} asChild>
                                            <Link href={`/courses/${course.id}/modules`}>
                                                <span className="hidden sm:inline">
                                                    {isInstructor ? 'Manage Modules' : 'View All Modules'}
                                                </span>
                                                <span className="sm:hidden">
                                                    {isInstructor ? 'Manage' : 'View All'}
                                                </span>
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm">
                                        {isStudent ? 'Continue your learning journey' : 'Quick overview of your course content'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                        {visibleModules.slice(0, 4).map((module) => (
                                            <Card key={module.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                                                <CardHeader className="pb-2 sm:pb-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            Module {module.order}
                                                        </Badge>
                                                        {!isStudent && (
                                                            module.is_published ? (
                                                                <Badge variant="default" className="text-xs">
                                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                                    Published
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Draft
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-sm sm:text-base">{module.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-2 sm:space-y-3">
                                                    {module.description && (
                                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                                            {module.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {module.itemsCount || 0} items
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            ~{Math.max(1, Math.ceil((module.itemsCount || 0) * 15 / 60))}h
                                                        </span>
                                                    </div>

                                                    {!isInstructor && (
                                                        <ModuleProgress
                                                            module={module}
                                                            completedItems={[]} // This would come from backend
                                                            showDetails={false}
                                                        />
                                                    )}

                                                    <div className="flex gap-2">
                                                        <Button size="sm" asChild className="flex-1">
                                                            <Link href={`/courses/${course.id}/modules/${module.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                {isInstructor ? 'Manage' : 'View'}
                                                            </Link>
                                                        </Button>
                                                        {isInstructor && (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {visibleModules.length > 4 && (
                                        <div className="text-center mt-4 sm:mt-6">
                                            <Button variant="outline" asChild>
                                                <Link href={`/courses/${course.id}/modules`}>
                                                    View All {visibleModules.length} Modules
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Content Tabs */}
                        <Card>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Course Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="assignments" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="assignments" className="text-xs sm:text-sm">Assignments</TabsTrigger>
                                        <TabsTrigger value="discussions" className="text-xs sm:text-sm">Discussions</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="assignments" className="space-y-3 sm:space-y-4 mt-4">
                                        {visibleAssignments.length > 0 ? (
                                            <div className="space-y-3 sm:space-y-4">
                                                {visibleAssignments.map((assignment) => (
                                                    <Card key={assignment.id} className="hover:shadow-sm transition-shadow">
                                                        <CardHeader className="pb-2 sm:pb-3">
                                                            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-base sm:text-lg">
                                                                <span className="min-w-0">{assignment.title}</span>
                                                                <Badge variant="outline" className="self-start sm:self-center">
                                                                    {assignment.points || 0} points
                                                                </Badge>
                                                            </CardTitle>
                                                            {assignment.description && (
                                                                <CardDescription className="text-xs sm:text-sm">{assignment.description}</CardDescription>
                                                            )}
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                                                    {assignment.due_date && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button variant="outline" size="sm" className="self-start sm:self-center">
                                                                    {isStudent ? 'Submit Assignment' : 'View Submissions'}
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 sm:py-8">
                                                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                                <h3 className="text-base sm:text-lg font-semibold mb-2">No assignments yet</h3>
                                                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                                                    {isInstructor
                                                        ? "Create assignments to assess student learning"
                                                        : "This course doesn't have any assignments yet."
                                                    }
                                                </p>
                                                {isInstructor && (
                                                    <Button size={isMobile ? "sm" : "default"} asChild>
                                                        <Link href={`/courses/${course.id}/assignments/create`}>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Create Assignment
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="discussions" className="space-y-3 sm:space-y-4 mt-4">
                                        {visibleDiscussions.length > 0 ? (
                                            <div className="space-y-3 sm:space-y-4">
                                                {visibleDiscussions.map((discussion) => (
                                                    <Card key={discussion.id} className="hover:shadow-sm transition-shadow">
                                                        <CardHeader className="pb-2 sm:pb-3">
                                                            <CardTitle className="text-base sm:text-lg">{discussion.title}</CardTitle>
                                                            <CardDescription className="text-xs sm:text-sm">
                                                                {new Date(discussion.created_at).toLocaleDateString()}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-3">{discussion.content}</p>
                                                            <Button variant="outline" size="sm">
                                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                                Join Discussion
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 sm:py-8">
                                                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                                                <h3 className="text-base sm:text-lg font-semibold mb-2">No discussions yet</h3>
                                                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                                                    Start a discussion to engage with your classmates
                                                </p>
                                                <Button size={isMobile ? "sm" : "default"} asChild>
                                                    <Link href={`/courses/${course.id}/discussions/create`}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Start Discussion
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Full width on mobile, 1/3 on desktop */}
                    <div className="space-y-4 lg:space-y-6">
                        {/* Course Image */}
                        {course.image && (
                            <Card className="overflow-hidden p-0">
                                <CardContent className="p-0">
                                    <img
                                        src={`/storage/${course.image}`}
                                        alt={course.name}
                                        className="w-full h-32 sm:h-48 object-cover"
                                    />
                                    <div className="p-3 sm:p-4">
                                        <p className="text-xs sm:text-sm text-muted-foreground">Course Banner</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-3 sm:pb-4">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 sm:space-y-3">
                                <Button variant="outline" className="w-full justify-start h-9 sm:h-10 text-sm" asChild>
                                    <Link href={`/courses/${course.id}/announcements`}>
                                        <Bell className="mr-2 h-4 w-4" />
                                        View Announcements
                                    </Link>
                                </Button>
                                {isInstructor && (
                                    <>
                                        <Button variant="outline" className="w-full justify-start h-9 sm:h-10 text-sm" asChild>
                                            <Link href={`/courses/${course.id}/students`}>
                                                <Users className="mr-2 h-4 w-4" />
                                                Manage Students
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start h-9 sm:h-10 text-sm" asChild>
                                            <Link href={`/courses/${course.id}/grades`}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Grades
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Announcements */}
                        {course.announcements && course.announcements.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Recent Announcements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    {course.announcements.slice(0, 3).map((announcement) => (
                                        <div key={announcement.id} className="border-l-2 border-primary pl-3 py-1">
                                            <p className="font-medium text-xs sm:text-sm mb-1">{announcement.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Progress (for students) */}
                        {isStudent && (
                            <Card>
                                <CardHeader className="pb-3 sm:pb-4">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                                        Your Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span>Modules Completed</span>
                                            <span className="font-medium">0 / {visibleModules.length}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Keep going! You're making great progress.
                                        </p>
                                    </div>
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
