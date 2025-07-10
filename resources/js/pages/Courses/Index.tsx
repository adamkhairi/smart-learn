import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Course, CoursesPageProps, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Calendar, Edit, Eye, Filter, MoreVertical, Plus, Search, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
];

function Index({ courses, userRole }: CoursesPageProps) {
    const { user, canManageCourse, isStudent } = useAuth();
    const isMobile = useIsMobile();
    const canCreateCourse = userRole === 'admin' || userRole === 'instructor';

    // Initialize flash toast notifications
    useFlashToast();

    // Initialize confirmation dialog and toast
    const { confirm, confirmDialog } = useConfirmDialog();
    const { success: showSuccess, error: showError } = useToast();

    // State for search and filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');

    // Filter and search courses
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesSearch =
                course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || course.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [courses, searchQuery, statusFilter]);

    const handleDelete = (courseId: number, courseName: string) => {
        confirm({
            title: 'Delete Course',
            description: `Are you sure you want to delete "${courseName}"? This action cannot be undone and will permanently remove all course content, modules, and enrollments.`,
            confirmText: 'Yes, Delete Course',
            variant: 'destructive',
            onConfirm: () => {
                router.delete(`/courses/${courseId}`, {
                    onSuccess: () => {
                        showSuccess('Course deleted successfully.');
                    },
                    onError: () => {
                        showError('Failed to delete course. Please try again.');
                    },
                });
            },
        });
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
        if (course.creator?.id === user?.id) {
            return (
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                    Creator
                </Badge>
            );
        }

        const enrollment = course.enrolled_users?.find((enrolledUser: User) => enrolledUser.id === user?.id);
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
        // Students cannot edit any course
        if (isStudent) return false;

        // Use the proper authentication check
        return canManageCourse(course.created_by);
    };

    console.log('courses', courses);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
                {/* Enhanced Header with Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Courses</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">Manage your learning journey</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {canCreateCourse && (
                            <Button asChild size={isMobile ? 'sm' : 'default'}>
                                <Link href="/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Create Course</span>
                                    <span className="sm:hidden">Create</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Filter Bar - Enhanced for Mobile */}
                {courses.length > 0 && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pl-9 sm:h-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size={isMobile ? 'sm' : 'default'} className="min-w-[120px] justify-start">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('published')}>Published</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('archived')}>Archived</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Results Summary */}
                {courses.length > 0 && searchQuery && (
                    <div className="text-sm text-muted-foreground">
                        {filteredCourses.length === 0 ? (
                            <span>No courses found matching "${searchQuery}"</span>
                        ) : (
                            <span>
                                {filteredCourses.length} of {courses.length} courses
                                {searchQuery && ` matching "${searchQuery}"`}
                            </span>
                        )}
                    </div>
                )}

                {/* Course Grid - Enhanced Responsive Layout */}
                {filteredCourses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                            <h3 className="mb-2 text-lg font-semibold sm:text-xl">{searchQuery ? 'No courses found' : 'No courses found'}</h3>
                            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground sm:text-base">
                                {searchQuery
                                    ? `No courses match your search for "${searchQuery}"`
                                    : canCreateCourse
                                      ? 'Get started by creating your first course'
                                      : "You haven't enrolled in any courses yet"}
                            </p>
                            {!searchQuery && canCreateCourse && (
                                <Button asChild>
                                    <Link href="/courses/create">
                                        <Plus className="mr-2 h-4 w-4" /> Create Course
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCourses.map((course) => (
                            <Card key={course.id} className="group flex flex-col overflow-hidden">
                                <Link href={`/courses/${course.id}`} className="relative block h-40 overflow-hidden" tabIndex={-1}>
                                    {course.image ? (
                                        <img
                                            src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                                            alt={course.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full w-full items-center justify-center"
                                            style={{ backgroundColor: course.background_color || '#f3f4f6' }}
                                        >
                                            <span className="text-4xl font-bold text-white opacity-70">
                                                {course.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 z-10">
                                        {getStatusBadge(course.status)}
                                    </div>
                                    {getRoleBadge(course) && (
                                        <div className="absolute bottom-2 left-2 z-10">
                                            {getRoleBadge(course)}
                                        </div>
                                    )}
                                </Link>
                                <CardContent className="flex flex-1 flex-col p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold leading-tight">
                                            <Link href={`/courses/${course.id}`} className="hover:underline">
                                                {course.name}
                                            </Link>
                                        </h3>
                                        {canEditCourse(course) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/courses/${course.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/courses/${course.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(course.id, course.name)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                                        {course.description || 'No description provided.'}
                                    </p>
                                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                        {course.creator && (
                                            <div className="flex items-center">
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>{course.creator.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            <span>Last updated {formatDistanceToNow(new Date(course.updated_at))} ago</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            {confirmDialog}
        </AppLayout>
    );
}

export default Index;
