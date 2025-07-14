import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useDebounce from '@/hooks/use-debounce';

import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';
import { Course, User as Creator, PaginatedResponse } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CourseStatusBadge } from '@/components/course-status-badge';

interface Props {
    courses: PaginatedResponse<Course>;
    creators: Creator[];
    filters: {
        search?: string;
        status?: string;
        creator?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function Index({ courses, creators, filters }: Props) {
    // Initialize flash toast notifications

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [creatorFilter, setCreatorFilter] = useState(filters.creator || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedStatusFilter = useDebounce(statusFilter, 500);
    const debouncedCreatorFilter = useDebounce(creatorFilter, 500);
    const debouncedSortBy = useDebounce(sortBy, 500);
    const debouncedSortOrder = useDebounce(sortOrder, 500);

    useEffect(() => {
        // Only trigger search if filters have actually changed from their initial values or previous debounced values
        const currentFilters = {
            search: filters.search,
            status: filters.status,
            creator: filters.creator,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
        };

        const debouncedFilters = {
            search: debouncedSearchTerm,
            status: debouncedStatusFilter,
            creator: debouncedCreatorFilter,
            sort_by: debouncedSortBy,
            sort_order: debouncedSortOrder,
        };

        if (JSON.stringify(currentFilters) !== JSON.stringify(debouncedFilters)) {
            router.get(
                route('admin.courses.index'),
                {
                    search: debouncedSearchTerm,
                    status: debouncedStatusFilter,
                    creator: debouncedCreatorFilter,
                    sort_by: debouncedSortBy,
                    sort_order: debouncedSortOrder,
                },
                { preserveState: true, preserveScroll: true },
            );
        }
    }, [debouncedSearchTerm, debouncedStatusFilter, debouncedCreatorFilter, debouncedSortBy, debouncedSortOrder]);

    // Removed handleSearch as it's now triggered by useEffect for debounced values

    const getInitials = (name: string) => {
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    return (
        <AppLayout>
            <Head title="Course Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
                        <p className="text-muted-foreground">Manage all courses, enrollments, and course content</p>
                    </div>
                    <Link href={route('admin.courses.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Course
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Button onClick={() => {}} size="sm"> {/* Removed direct handleSearch click */}
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Creator</label>
                                <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Creators</SelectItem>
                                        {creators.map((creator) => (
                                            <SelectItem key={creator.id} value={creator.id.toString()}>
                                                {creator.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sort By</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Created Date</SelectItem>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Order</label>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Descending</SelectItem>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Course List */}
                <div className="grid gap-6">
                    {courses.data.length > 0 ? (
                        courses.data.map((course: Course) => (
                            <Card key={course.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <Link href={route('admin.courses.show', course.id)} className="relative block h-16 w-16 flex-shrink-0">
                                                <div
                                                    className="flex h-full w-full items-center justify-center truncate rounded-lg bg-muted text-xl font-bold text-white select-none"
                                                    style={{ backgroundColor: course.background_color }}
                                                >
                                                    {course.image ? (
                                                        <AspectRatio ratio={1 / 1}>
                                                            <img
                                                                src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                                                                alt={course.name}
                                                                className="h-full w-full rounded-lg object-cover"
                                                            />
                                                        </AspectRatio>
                                                    ) : (
                                                        getInitials(course.name)
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="space-y-2">
                                                <Link href={route('admin.courses.show', course.id)} className="hover:underline">
                                                    <h3 className="text-xl font-semibold">{course.name}</h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {course.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CourseStatusBadge status={course.status} />
                                                    <span>&bull;</span>
                                                    <span>{course.category?.name || 'Uncategorized'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Course options</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('admin.courses.show', course.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('admin.courses.edit', course.id)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('admin.courses.enrollments', course.id)}>
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Enrollments
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('admin.courses.analytics', course.id)}>
                                                        <BarChart3 className="mr-2 h-4 w-4" />
                                                        Analytics
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {}}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mt-4 flex justify-between gap-4 border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={course.creator?.photo} />
                                                <AvatarFallback>{getInitials(course.creator?.name || 'N/A')}</AvatarFallback>
                                            </Avatar>
                                            <span>{course.creator?.name || 'Unknown Creator'}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">Updated {formatDate(course.updated_at)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-muted-foreground">No courses found.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {courses?.meta?.last_page && courses.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(courses.meta.current_page - 1) * courses.meta.per_page + 1} to{' '}
                            {Math.min(courses.meta.current_page * courses.meta.per_page, courses.meta.total)} of {courses.meta.total} courses
                        </p>

                        <div className="flex gap-2">
                            {courses.meta.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(route('admin.courses.index'), {
                                            ...filters,
                                            page: courses.meta.current_page - 1,
                                        })
                                    }
                                >
                                    Previous
                                </Button>
                            )}

                            {courses.meta.current_page < courses.meta.last_page && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(route('admin.courses.index'), {
                                            ...filters,
                                            page: courses.meta.current_page + 1,
                                        })
                                    }
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
