import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseShowPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, BookOpen, Calendar, Edit, Plus, FileText, MessageSquare, Bell } from 'lucide-react';

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

function Show({ course, userEnrollment, userRole }: CourseShowPageProps) {
    const isInstructor = userRole === 'admin' || course.created_by === userEnrollment?.user_id;
    const isStudent = userEnrollment?.enrolled_as === 'student';

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(`/courses/${course.id}`);
        }
    };

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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{course.name}</h1>
                            {getStatusBadge(course.status)}
                        </div>
                        <p className="text-muted-foreground">
                            Created by {course.creator?.name} • {new Date(course.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isInstructor && (
                            <>
                                <Button asChild>
                                    <Link href={`/courses/${course.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Course
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={`/courses/${course.id}/modules/create`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Module
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Course Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="modules">Modules</TabsTrigger>
                                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {course.description ? (
                                            <p className="text-muted-foreground">{course.description}</p>
                                        ) : (
                                            <p className="text-muted-foreground italic">No description provided.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Course Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-2xl font-bold">{course.enrolled_users?.length || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Students</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-2xl font-bold">{course.modules?.length || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Modules</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-2xl font-bold">{course.assignments?.length || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Assignments</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-2xl font-bold">{course.discussions?.length || 0}</p>
                                                    <p className="text-xs text-muted-foreground">Discussions</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="modules" className="space-y-4">
                                {course.modules && course.modules.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.modules.map((module) => (
                                            <Card key={module.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{module.title}</span>
                                                        {isInstructor && (
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </CardTitle>
                                                    {module.description && (
                                                        <CardDescription>{module.description}</CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    {module.items && module.items.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {module.items.map((item) => (
                                                                <div key={item.id} className="flex items-center gap-3 p-2 rounded border">
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">{item.title}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                                        </p>
                                                                    </div>
                                                                    <Button variant="ghost" size="sm">
                                                                        View
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted-foreground text-center py-4">
                                                            No items in this module yet.
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                                            <p className="text-muted-foreground text-center mb-4">
                                                {isInstructor
                                                    ? "Start building your course by adding modules"
                                                    : "This course doesn't have any modules yet."
                                                }
                                            </p>
                                            {isInstructor && (
                                                <Button asChild>
                                                    <Link href={`/courses/${course.id}/modules/create`}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add First Module
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="assignments" className="space-y-4">
                                {course.assignments && course.assignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.assignments.map((assignment) => (
                                            <Card key={assignment.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span>{assignment.title}</span>
                                                        <Badge variant="outline">
                                                            {assignment.points || 0} points
                                                        </Badge>
                                                    </CardTitle>
                                                    {assignment.description && (
                                                        <CardDescription>{assignment.description}</CardDescription>
                                                    )}
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            {assignment.due_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            {isStudent ? 'Submit Assignment' : 'View Submissions'}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
                                            <p className="text-muted-foreground text-center mb-4">
                                                {isInstructor
                                                    ? "Create assignments to assess student learning"
                                                    : "This course doesn't have any assignments yet."
                                                }
                                            </p>
                                            {isInstructor && (
                                                <Button asChild>
                                                    <Link href={`/courses/${course.id}/assignments/create`}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create Assignment
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="discussions" className="space-y-4">
                                {course.discussions && course.discussions.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.discussions.map((discussion) => (
                                            <Card key={discussion.id}>
                                                <CardHeader>
                                                    <CardTitle>{discussion.title}</CardTitle>
                                                    <CardDescription>
                                                        {new Date(discussion.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground mb-4">{discussion.content}</p>
                                                    <Button variant="outline" size="sm">
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Join Discussion
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-12">
                                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                                            <p className="text-muted-foreground text-center mb-4">
                                                Start a discussion to engage with your classmates
                                            </p>
                                            <Button asChild>
                                                <Link href={`/courses/${course.id}/discussions/create`}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Start Discussion
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Course Image */}
                        {course.image && (
                            <Card>
                                <CardContent className="p-4">
                                    <img
                                        src={`/storage/${course.image}`}
                                        alt={course.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/courses/${course.id}/announcements`}>
                                        <Bell className="mr-2 h-4 w-4" />
                                        View Announcements
                                    </Link>
                                </Button>
                                {isInstructor && (
                                    <>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <Link href={`/courses/${course.id}/students`}>
                                                <Users className="mr-2 h-4 w-4" />
                                                Manage Students
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" asChild>
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
                                <CardHeader>
                                    <CardTitle>Recent Announcements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {course.announcements.slice(0, 3).map((announcement) => (
                                        <div key={announcement.id} className="border-l-2 border-primary pl-3">
                                            <p className="font-medium text-sm">{announcement.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
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
