import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, BookOpen, FileText, MessageSquare, Bell, TrendingUp, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';

interface Course {
  id: number;
  name: string;
  status: string;
  background_color: string;
}

interface Stats {
  total_students: number;
  total_instructors: number;
  total_modules: number;
  total_published_modules: number;
  total_assignments: number;
  total_assessments: number;
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

interface EnrollmentTrend {
  date: string;
  count: number;
}

interface Props {
  course: Course;
  stats: Stats;
  recentActivity: RecentActivity[];
  enrollmentTrends: EnrollmentTrend[];
}

export default function Analytics({ course, stats, recentActivity, enrollmentTrends }: Props) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'submission':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <Head title={`${course.name} - Analytics`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{course.name} Analytics</h1>
              <p className="text-muted-foreground">
                Detailed insights and performance metrics
              </p>
            </div>
          </div>

          <Link href={route('admin.courses.show', course.id)}>
            <Button variant="outline">
              View Course
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_students}</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in this course
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_modules}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_published_modules} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_assignments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_assessments} assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_discussions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_announcements} announcements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>
                Overall completion and enrollment metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enrollment Rate</span>
                  <span>{stats.enrollment_rate}%</span>
                </div>
                <Progress value={stats.enrollment_rate} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {stats.total_students} students enrolled out of 50 capacity
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span>{stats.completion_rate}%</span>
                </div>
                <Progress value={stats.completion_rate} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Average completion across all modules
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_instructors}</div>
                  <div className="text-sm text-muted-foreground">Instructors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.total_published_modules}</div>
                  <div className="text-sm text-muted-foreground">Published Modules</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>
                Student enrollment over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollmentTrends.length > 0 ? (
                <div className="space-y-3">
                  {enrollmentTrends.slice(-7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(trend.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(trend.count / Math.max(...enrollmentTrends.map(t => t.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {trend.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No enrollment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities and interactions in the course
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{activity.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {activity.user.name} • {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Module Completion</span>
                <span className="text-sm font-medium">{stats.completion_rate}%</span>
              </div>
              <Progress value={stats.completion_rate} className="h-2" />

              <div className="flex justify-between items-center">
                <span className="text-sm">Student Engagement</span>
                <span className="text-sm font-medium">
                  {stats.total_discussions + stats.total_announcements} interactions
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Assessment Coverage</span>
                <span className="text-sm font-medium">
                  {stats.total_assignments + stats.total_assessments} total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={route('admin.courses.enrollments', course.id)} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Enrollments
                </Button>
              </Link>
              <Link href={route('admin.courses.edit', course.id)} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Edit Course Content
                </Button>
              </Link>
              <Link href={route('admin.courses.show', course.id)} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Course Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
