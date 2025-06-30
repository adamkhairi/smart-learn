import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Users, BarChart3, Calendar, BookOpen, FileText, MessageSquare, Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  image?: string;
  background_color: string;
  created_at: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  enrolled_users: Array<{
    id: number;
    name: string;
    email: string;
    pivot: {
      enrolled_as: string;
      created_at: string;
    };
  }>;
  modules: Array<{
    id: number;
    name: string;
    is_published: boolean;
    module_items: Array<{
      id: number;
      title: string;
      type: string;
    }>;
  }>;
  assignments: Array<{
    id: number;
    title: string;
    due_date: string;
  }>;
  assessments: Array<{
    id: number;
    title: string;
    type: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    created_at: string;
    creator: {
      name: string;
    };
  }>;
  discussions: Array<{
    id: number;
    title: string;
    created_at: string;
    creator: {
      name: string;
    };
  }>;
}

interface Stats {
  total_students: number;
  total_instructors: number;
  total_modules: number;
  total_published_modules: number;
  total_assignments: number;
  total_assessments: number;
  total_exams: number;
  total_announcements: number;
  total_discussions: number;
  enrollment_rate: number;
  completion_rate: number;
}

interface RecentActivity {
  type: string;
  title: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface Props {
  course: Course;
  stats: Stats;
  recentActivity: RecentActivity[];
}

export default function Show({ course, stats, recentActivity }: Props) {
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'success',
      archived: 'destructive',
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      student: 'default',
      instructor: 'secondary',
      admin: 'destructive',
    } as const;

    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      case 'submission':
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Head title={course.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
                {getStatusBadge(course.status)}
              </div>
              <p className="text-muted-foreground">
                Created by {course.creator.name} on {new Date(course.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={route('admin.courses.edit', course.id)}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>
            </Link>
            <Link href={route('admin.courses.enrollments', course.id)}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Enrollments
              </Button>
            </Link>
            <Link href={route('admin.courses.analytics', course.id)}>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Course Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Image and Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.image && (
                  <div
                    className="w-full h-48 rounded-lg overflow-hidden"
                    style={{ backgroundColor: course.background_color }}
                  >
                    <img
                      src={`/storage/${course.image}`}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {course.description || 'No description available'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Creator</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {getInitials(course.creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{course.creator.name}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total_students}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.total_instructors}</div>
                    <div className="text-sm text-muted-foreground">Instructors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.total_modules}</div>
                    <div className="text-sm text-muted-foreground">Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.total_assignments}</div>
                    <div className="text-sm text-muted-foreground">Assignments</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enrollment Rate</span>
                    <span>{stats.enrollment_rate}%</span>
                  </div>
                  <Progress value={stats.enrollment_rate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{stats.completion_rate}%</span>
                  </div>
                  <Progress value={stats.completion_rate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={route('admin.courses.enrollments', course.id)} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Enrollments
                  </Button>
                </Link>
                <Link href={route('admin.courses.analytics', course.id)} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
                <Link href={route('admin.courses.edit', course.id)} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Modules ({course.modules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.modules.length > 0 ? (
                <div className="space-y-2">
                  {course.modules.slice(0, 5).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.module_items.length} items
                        </div>
                      </div>
                      <Badge variant={module.is_published ? 'success' : 'secondary'}>
                        {module.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                  {course.modules.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{course.modules.length - 5} more modules
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No modules created yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.user.name} • {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Users */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Users ({course.enrolled_users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {course.enrolled_users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.enrolled_users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {getRoleBadge(user.pivot.enrolled_as)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No users enrolled yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
