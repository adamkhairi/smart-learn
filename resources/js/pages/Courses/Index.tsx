import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CoursesPageProps, Course, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, Calendar, Edit, Trash2, Eye, MoreVertical, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

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

    // State for search and filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');

    // Filter and search courses
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                course.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || course.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [courses, searchQuery, statusFilter]);

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
            <div className="flex h-full flex-1 flex-col gap-4 lg:gap-6 overflow-x-auto rounded-xl p-4 lg:p-6">
                {/* Enhanced Header with Search and Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Courses</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Manage your learning journey
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {canCreateCourse && (
                            <Button asChild size={isMobile ? "sm" : "default"}>
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
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 sm:h-10"
                            />
                        </div>

                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size={isMobile ? "sm" : "default"} className="justify-start min-w-[120px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                    All Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('published')}>
                                    Published
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                                    Archived
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Results Summary */}
                {courses.length > 0 && searchQuery && (
                    <div className="text-sm text-muted-foreground">
                        {filteredCourses.length === 0 ? (
                            <span>No courses found matching "{searchQuery}"</span>
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
                            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                {searchQuery ? 'No courses found' : 'No courses found'}
                            </h3>
                            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md">
                                {searchQuery ? (
                                    `No courses match your search for "${searchQuery}"`
                                ) : canCreateCourse ? (
                                    "Get started by creating your first course"
                                ) : (
                                    "You haven't enrolled in any courses yet"
                                )}
                            </p>
                            {!searchQuery && canCreateCourse && (
                                <Button asChild size={isMobile ? "sm" : "default"}>
                                    <Link href="/courses/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Course
                                    </Link>
                                </Button>
                            )}
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery('')}
                                    size={isMobile ? "sm" : "default"}
                                >
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-6">
                        {filteredCourses.map((course) => (
                            <Card
                                key={course.id}
                                className="group hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                            >
                                <CardHeader className="pb-3 sm:pb-4 flex-shrink-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/courses/${course.id}`}
                                                className="block"
                                            >
                                                <CardTitle className="line-clamp-2 hover:text-primary transition-colors cursor-pointer text-base sm:text-lg leading-snug">
                                                    {course.name}
                                                </CardTitle>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {getStatusBadge(course.status)}
                                                {getRoleBadge(course)}
                                            </div>
                                        </div>

                                        {/* Action Menu - Enhanced for Touch */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                                            {/* Mobile: Always show dropdown */}
                                            {isMobile ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/courses/${course.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {canEditCourse(course) && (
                                                            <>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/courses/${course.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(course.id);
                                                                    }}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                /* Desktop: Individual buttons */
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Link href={`/courses/${course.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {canEditCourse(course) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-32">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/courses/${course.id}/edit`}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(course.id);
                                                                    }}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0 flex flex-col justify-between flex-1">
                                    <div className="flex-1">
                                        {course.description && (
                                            <CardDescription className="line-clamp-3 mb-4 text-sm sm:text-base leading-relaxed">
                                                {course.description}
                                            </CardDescription>
                                        )}
                                    </div>

                                    {/* Course Stats - Responsive Grid */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                <span className="truncate">{course.enrolled_users?.length || 0} students</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                <span className="truncate">{course.modules?.length || 0} modules</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span className="truncate">
                                                    {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {course.creator && (
                                                <span className="truncate max-w-[120px]">
                                                    by {course.creator.name}
                                                </span>
                                            )}
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
