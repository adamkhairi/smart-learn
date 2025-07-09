import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Eye, Edit, Trash2, Users, BarChart3, MoreHorizontal, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { useFlashToast } from '@/hooks/use-flash-toast';

interface Course {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  background_color: string;
  image?: string;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  enrolled_users: Array<{
    id: number;
    name: string;
    pivot: {
      enrolled_as: string;
    };
  }>;
}

interface Creator {
  id: number;
  name: string;
  email: string;
}

interface Props {
  courses: {
    data: Course[];
    links: Record<string, unknown>;
    meta: Record<string, unknown>;
  };
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
  useFlashToast();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [creatorFilter, setCreatorFilter] = useState(filters.creator || 'all');
  const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
  const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

  const handleSearch = () => {
    router.get(route('admin.courses.index'), {
      search: searchTerm,
      status: statusFilter,
      creator: creatorFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    }, { preserveState: true });
  };

  const getStatusBadge = (status: 'draft' | 'published' | 'archived') => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'destructive',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

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

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
            <p className="text-muted-foreground">
              Manage all courses, enrollments, and course content
            </p>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
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
          {courses.data.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center bg-muted text-white font-bold text-xl truncate select-none"
                      style={{ backgroundColor: course.background_color }}
                    >
                      {course.image ? (
                        <img
                          src={course.image.startsWith('http') ? course.image : `/storage/${course.image}`}
                          alt={course.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getInitials(course.name)
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{course.name}</h3>
                        {getStatusBadge(course.status)}
                      </div>

                      <p className="text-muted-foreground line-clamp-2">
                        {course.description || 'No description available'}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {course.creator ? getInitials(course.creator.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{course.creator?.name || 'Unknown Creator'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrolled_users.length} enrolled</span>
                        </div>

                        <span>
                          Created {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={route('admin.courses.edit', course.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={route('admin.courses.enrollments', course.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Enrollments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={route('admin.courses.analytics', course.id)}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          // Handle delete confirmation
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {courses.meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((courses.meta.current_page - 1) * courses.meta.per_page) + 1} to{' '}
              {Math.min(courses.meta.current_page * courses.meta.per_page, courses.meta.total)} of{' '}
              {courses.meta.total} courses
            </p>

            <div className="flex gap-2">
              {courses.meta.current_page > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(route('admin.courses.index'), {
                    ...filters,
                    page: courses.meta.current_page - 1,
                  })}
                >
                  Previous
                </Button>
              )}

              {courses.meta.current_page < courses.meta.last_page && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.get(route('admin.courses.index'), {
                    ...filters,
                    page: courses.meta.current_page + 1,
                  })}
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
