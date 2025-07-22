import { CourseRoleBadge } from '@/components/course-role-badge';
import { CourseStatusBadge } from '@/components/course-status-badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionMenu, commonActions } from '@/components/ui/action-button';
import { PageHeader, commonActions as pageActions } from '@/components/ui/page-header';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { useAuth } from '@/hooks/use-auth';
import useDebounce from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Course, CoursesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Calendar, Plus, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

interface ActionMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
}

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

    // Initialize confirmation dialog
    const { confirm, confirmDialog } = useConfirmDialog();

    // State for search and filtering
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived' | 'my_courses'>(
        (filters.status as 'all' | 'published' | 'archived') || 'all',
    );

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

    // Filter enrolled courses for students
    const enrolledCourses = isStudent ? courses.data.filter((course) => course.pivot?.enrolled_as === 'student') : [];

    // Filter and search courses directly in render
    const coursesToDisplay = courses.data.filter((course) => {
        const matchesSearch =
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) || course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || course.status === statusFilter || (statusFilter === 'my_courses' && course.pivot?.enrolled_as === 'student');

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

    // Memoize search filter options
    const searchFilterOptions = useMemo(() => [
        { value: 'all', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' },
        ...(isStudent ? [{ value: 'my_courses', label: 'My Courses' }] : []),
    ], [isStudent]);

    // Page Header Actions
    // const pageHeaderActions: React.ReactNode | null = canCreateCourse
    //     ? pageActions.create('/courses/create', 'Create Course', <Plus className="mr-2 h-4 w-4" />)
    //     : null;

    // Handle status filter change with proper typing
    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value as 'all' | 'published' | 'archived' | 'my_courses');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
                {/* Page Header */}
                <PageHeader
                    title="Courses"
                    description="Manage your learning journey"
                    actions={canCreateCourse
                        ? pageActions.create('/courses/create', 'Create Course', <Plus className="mr-2 h-4 w-4" />)
                        : null
                    }
                />

                {/* Search and Filter Bar */}
                {(courses.data && courses.data.length > 0) || searchQuery || statusFilter !== 'all' ? (
                    <SearchFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        searchPlaceholder="Search courses..."
                        filters={[
                            {
                                key: 'status',
                                value: statusFilter,
                                label: 'Status',
                                options: searchFilterOptions,
                                onChange: handleStatusFilterChange,
                            },
                        ]}
                        showClearButton={true}
                        onClear={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                        }}
                    />
                ) : null}

                {/* My Enrolled Courses Section - Only for Students */}
                {(() => {
                    const showEnrolledSection = isStudent && enrolledCourses.length > 0 && statusFilter === 'all' && !searchQuery;
                    return showEnrolledSection;
                })() && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">My Enrolled Courses</h2>
                            <Badge variant="secondary" className="text-xs">
                                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {enrolledCourses.slice(0, 4).map((course) => (
                                <Card key={course.id} className="group flex flex-col overflow-hidden border-2 border-primary/20">
                                    <Link href={route('courses.public_show', course.id)} className="relative block h-32 overflow-hidden" tabIndex={-1}>
                                        {course.image ? (
                                            <AspectRatio ratio={16 / 9}>
                                                <img
                                                    src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                                                    alt={course.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </AspectRatio>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                                                <BookOpen className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                                            </div>
                                        )}
                                    </Link>
                                    <CardContent className="flex flex-1 flex-col p-4">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <h3 className="line-clamp-2 flex-1 font-semibold leading-tight">
                                                <Link href={route('courses.public_show', course.id)} className="hover:text-primary">
                                                    {course.name}
                                                </Link>
                                            </h3>
                                            <div>
                                                <CourseRoleBadge course={course} user={user} />
                                            </div>
                                        </div>
                                        {course.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                {course.description}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {String(course.enrolled_users_count || 0)} students
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Courses Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {coursesToDisplay.map((course) => {
                        const actionItems: ActionMenuItem[] = [
                            commonActions.view(() => router.visit(route('courses.public_show', course.id))),
                            ...(canEditCourse(course) ? [
                                commonActions.edit(() => router.visit(route('courses.edit', course.id))),
                                commonActions.delete(() => handleDelete(course.id, course.name)),
                            ] : []),
                        ];

                        return (
                            <Card key={course.id} className="group flex flex-col overflow-hidden">
                                <Link href={route('courses.public_show', course.id)} className="relative block h-32 overflow-hidden" tabIndex={-1}>
                                    {course.image ? (
                                        <AspectRatio ratio={16 / 9}>
                                            <img
                                                src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                                                alt={course.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </AspectRatio>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                                            <BookOpen className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                                        </div>
                                    )}
                                </Link>
                                <CardContent className="flex flex-1 flex-col p-4">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <h3 className="line-clamp-2 flex-1 font-semibold leading-tight">
                                            <Link href={route('courses.public_show', course.id)} className="hover:text-primary">
                                                {course.name}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <CourseStatusBadge status={course.status} />
                                            {course.pivot?.enrolled_as && (
                                                <CourseRoleBadge course={course} user={user} />
                                            )}
                                        </div>
                                    </div>
                                    {course.description && (
                                        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                            {course.description}
                                        </p>
                                    )}
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {String(course.enrolled_users_count || 0)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        {actionItems.length > 1 ? <ActionMenu items={actionItems} /> : null}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty State */}
                {coursesToDisplay.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                                {searchQuery || statusFilter !== 'all' ? 'No courses found' : 'No courses yet'}
                            </h3>
                            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground sm:text-base">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : canCreateCourse
                                    ? 'Get started by creating your first course'
                                    : 'No courses are available at the moment'}
                            </p>
                            {canCreateCourse && !searchQuery && statusFilter === 'all' && (
                                <Button asChild size={isMobile ? 'sm' : 'default'}>
                                    <Link href="/courses/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Course
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {confirmDialog}
            </div>
        </AppLayout>
    );
}

export default Index;
