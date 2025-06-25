import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CoursesPageProps, Course, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
];

function Index({ courses, userRole }: CoursesPageProps) {
    const canCreateCourse = userRole === 'admin' || userRole === 'instructor';

    const handleDelete = (courseId: number) => {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(`/courses/${courseId}`);
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

    const getRoleBadge = (course: Course) => {
        if (course.creator?.id === courses[0]?.creator?.id) {
            return (
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                    Creator
                </Badge>
            );
        }

        const enrollment = course.enrolled_users?.find((user: User) => user.id === courses[0]?.creator?.id);
        if (enrollment) {
            return (
                <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">
                    {enrollment.pivot?.enrolled_as || 'Student'}
                </Badge>
            );
        }

        return null;
    };

    const canEditCourse = (course: Course) => {
        return userRole === 'admin' || course.created_by === courses[0]?.creator?.id;
    };

    console.log('courses', courses);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Courses</h1>
                        <p className="text-muted-foreground">
                            Manage your learning journey
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canCreateCourse && (
                            <Button asChild>
                                <Link href="/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Course
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {courses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {canCreateCourse
                                    ? "Get started by creating your first course"
                                    : "You haven't enrolled in any courses yet"
                                }
                            </p>
                            {canCreateCourse && (
                                <Button asChild>
                                    <Link href="/courses/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Course
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="group hover:shadow-lg transition-all"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="line-clamp-2">
                                                    {course.name}
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(course.status)}
                                                {getRoleBadge(course)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Link href={`/courses/${course.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {canEditCourse(course) && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Link href={`/courses/${course.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(course.id);
                                                        }}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {course.description && (
                                        <CardDescription className="line-clamp-3 mb-4">
                                            {course.description}
                                        </CardDescription>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course.enrolled_users?.length || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{course.modules?.length || 0} modules</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

export default Index;
