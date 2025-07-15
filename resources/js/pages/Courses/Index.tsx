import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Course, CoursesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Calendar, Edit, Eye, Filter, MoreVertical, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import useDebounce from '@/hooks/use-debounce';
import { CourseStatusBadge } from '@/components/course-status-badge';
import { CourseRoleBadge } from '@/components/course-role-badge';
import React from 'react';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Courses',
        href: '/courses',
    },
];

function Index({ courses, userRole, filters }: CoursesPageProps) {
    const { user, canManageCourse, isStudent } = useAuth();
    const isMobile = useIsMobile();
    const canCreateCourse = userRole === 'admin' || userRole === 'instructor';

    // Initialize confirmation dialog and toast
    const { confirm, confirmDialog } = useConfirmDialog();

    // State for search and filtering
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>(filters.status as 'all' | 'published' | 'archived' || 'all');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const debouncedStatusFilter = useDebounce(statusFilter, 500);

    useEffect(() => {
        // Only trigger search if filters have actually changed from their initial values or previous debounced values
        const currentFilters = {
            search: filters.search,
            status: filters.status,
        };

        const debouncedFilters = {
            search: debouncedSearchQuery,
            status: debouncedStatusFilter,
        };

        if (JSON.stringify(currentFilters) !== JSON.stringify(debouncedFilters)) {
            router.get(
                route('courses.index'),
                {
                    search: debouncedSearchQuery,
                    status: debouncedStatusFilter,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    }, [debouncedSearchQuery, debouncedStatusFilter]);

    // Filter and search courses directly in render
    const coursesToDisplay = courses.data.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = (courseId: number, courseName: string) => {
        confirm({
            title: 'Delete Course',
            description: `Are you sure you want to delete "${courseName}"? This action cannot be undone and will permanently remove all course content, modules, and enrollments.`,
            confirmText: 'Yes, Delete Course',
            variant: 'destructive',
            onConfirm: () => {
                router.delete(`/courses/${courseId}`);
            },
        });
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
                {(courses.data && courses.data.length > 0) || (searchQuery || statusFilter !== 'all') ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
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
                ) : null}

                {/* Results Summary */}
                {courses.data && (searchQuery || statusFilter !== 'all') && (
                    <div className="text-sm text-muted-foreground">
                        {coursesToDisplay.length === 0 ? (
                            <span>No courses found matching your criteria.</span>
                        ) : (
                            <span>
                                {coursesToDisplay.length} of {courses.meta.total} courses
                                {(searchQuery || statusFilter !== 'all') && ` matching current filters`}
                            </span>
                        )}
                    </div>
                )}

                {/* Course Grid - Enhanced Responsive Layout */}
                {coursesToDisplay.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                                {searchQuery || statusFilter !== 'all' ? 'No courses match your criteria' : 'No courses found'}
                            </h3>
                            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground sm:text-base">
                                {searchQuery || statusFilter !== 'all'
                                    ? "Try adjusting your search terms or filters to find what you're looking for."
                                    : canCreateCourse
                                      ? 'Get started by creating your first course'
                                      : "You haven't enrolled in any courses yet"}
                            </p>
                            {!searchQuery && statusFilter === 'all' && canCreateCourse && (
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
                        {coursesToDisplay.map((course) => (
                            <Card key={course.id} className="group flex flex-col overflow-hidden">
                                <Link
                                    href={
                                        (user === null || (isStudent && !course.pivot?.enrolled_as && !course.is_private))
                                            ? route('courses.public_show', course.id)
                                            : route('courses.show', course.id)
                                    }
                                    className="relative block h-40 overflow-hidden"
                                    tabIndex={-1}
                                >
                                    {course.image ? (
                                        <AspectRatio ratio={16 / 9}>
                                            <img
                                                src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                                                alt={course.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </AspectRatio>
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
                                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                                        <CourseStatusBadge status={course.status} />
                                        {course.is_private && (
                                            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                                Private
                                            </Badge>
                                        )}
                                    </div>
                                    {/* Use the new CourseRoleBadge component */}
                                    <div className="absolute bottom-2 left-2 z-10">
                                        <CourseRoleBadge course={course} user={user} />
                                    </div>
                                </Link>
                                <CardContent className="flex flex-1 flex-col p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold leading-tight">
                                            <Link
                                                href={
                                                    (user === null || (isStudent && !course.pivot?.enrolled_as && !course.is_private))
                                                        ? route('courses.public_show', course.id)
                                                        : route('courses.show', course.id)
                                                }
                                                className="hover:underline"
                                             >
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
                {/* Pagination */}
                {courses.meta && courses.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(courses.meta.current_page - 1) * courses.meta.per_page + 1} to{' '}
                            {Math.min(courses.meta.current_page * courses.meta.per_page, courses.meta.total)} of {courses.meta.total} courses
                        </p>

                        <div className="flex gap-2">
                            {courses.links.map((link, index) => (
                                <React.Fragment key={index}>
                                    {link.url === null ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(link.url!)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {confirmDialog}
        </AppLayout>
    );
}

export default Index;
