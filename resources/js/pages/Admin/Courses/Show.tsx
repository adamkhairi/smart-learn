import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ArrowLeft,
  Edit,
  Users,
  BarChart3,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  Share2,
  Eye,
  UserPlus,
  GraduationCap,
  Target,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUsers, setSearchUsers] = useState('');

  const getStatusBadge = (status: 'draft' | 'published' | 'archived') => {
    const config = {
      draft: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      published: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      archived: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
    };

    const { variant, icon: Icon, color } = config[status];
    return (
      <Badge variant={variant} className="capitalize">
        <Icon className={`mr-1 h-3 w-3 ${color}`} />
        {status}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const config = {
      student: { variant: 'default' as const, icon: GraduationCap, color: 'bg-blue-100 text-blue-800' },
      instructor: { variant: 'secondary' as const, icon: Users, color: 'bg-purple-100 text-purple-800' },
      admin: { variant: 'destructive' as const, icon: Settings, color: 'bg-red-100 text-red-800' },
    };

    const { icon: Icon, color } = config[role as keyof typeof config] || { icon: Users, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={`${color} capitalize`}>
        <Icon className="mr-1 h-3 w-3" />
        {role}
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    const iconConfig = {
      announcement: { icon: Bell, color: 'text-blue-600 bg-blue-100' },
      discussion: { icon: MessageSquare, color: 'text-green-600 bg-green-100' },
      submission: { icon: FileText, color: 'text-orange-600 bg-orange-100' },
      default: { icon: Calendar, color: 'text-gray-600 bg-gray-100' },
    };

    const { icon: Icon, color } = iconConfig[type as keyof typeof iconConfig] || iconConfig.default;

    return (
      <div className={`p-2 rounded-full ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    change?: number;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+{change}% from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredUsers = course.enrolled_users.filter(user =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <AppLayout>
      <Head title={course.name} />

      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              {course.image ? (
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-sm"
                  style={{ backgroundColor: course.background_color }}
                >
                  <img
                    src={`/storage/${course.image}`}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm"
                  style={{ backgroundColor: course.background_color }}
                >
                  {course.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
                  {getStatusBadge(course.status)}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {getInitials(course.creator.name)}
                    </AvatarFallback>
                  </Avatar>
                  Created by {course.creator.name} on {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={route('admin.courses.edit', course.id)}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Button>
              </Link>
              <Link href={route('admin.courses.enrollments', course.id)}>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Enrollments
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
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.total_students}
            icon={GraduationCap}
            color="text-blue-600"
            change={12}
          />
          <StatCard
            title="Instructors"
            value={stats.total_instructors}
            icon={Users}
            color="text-purple-600"
            change={5}
          />
          <StatCard
            title="Modules"
            value={stats.total_modules}
            icon={BookOpen}
            color="text-green-600"
          />
          <StatCard
            title="Assignments"
            value={stats.total_assignments}
            icon={Target}
            color="text-orange-600"
          />
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Description */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {course.description || 'No description available for this course. Consider adding a detailed description to help students understand what they will learn.'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Enrollment Rate</span>
                      <span className="text-sm text-muted-foreground">{stats.enrollment_rate}%</span>
                    </div>
                    <Progress value={stats.enrollment_rate} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm text-muted-foreground">{stats.completion_rate}%</span>
                    </div>
                    <Progress value={stats.completion_rate} className="h-3" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Published Modules</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.total_published_modules}/{stats.total_modules}
                      </span>
                    </div>
                    <Progress
                      value={stats.total_modules > 0 ? (stats.total_published_modules / stats.total_modules) * 100 : 0}
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Assessments</p>
                      <p className="text-2xl font-bold">{stats.total_assessments}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Announcements</p>
                      <p className="text-2xl font-bold">{stats.total_announcements}</p>
                    </div>
                    <Bell className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Discussions</p>
                      <p className="text-2xl font-bold">{stats.total_discussions}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modules */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Modules ({course.modules.length})
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      Add Module
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {course.modules.length > 0 ? (
                    <div className="space-y-3">
                      {course.modules.map((module, index) => (
                        <div key={module.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {module.module_items.length} items
                            </div>
                          </div>
                          <Badge variant={module.is_published ? 'default' : 'secondary'}>
                            {module.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No modules created yet</p>
                      <Button size="sm" className="mt-2">Create First Module</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assignments & Assessments */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Assignments ({course.assignments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {course.assignments.slice(0, 3).map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-2 rounded border">
                            <div>
                              <div className="font-medium">{assignment.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No assignments yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Assessments ({course.assessments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.assessments.length > 0 ? (
                      <div className="space-y-2">
                        {course.assessments.slice(0, 3).map((assessment) => (
                          <div key={assessment.id} className="flex items-center justify-between p-2 rounded border">
                            <div>
                              <div className="font-medium">{assessment.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Type: {assessment.type}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No assessments yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enrolled Users ({course.enrolled_users.length})</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {getRoleBadge(user.pivot.enrolled_as)}
                            <span className="text-xs text-muted-foreground">
                              {new Date(user.pivot.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {searchUsers ? 'No users found matching your search' : 'No users enrolled yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {activity.user.name} • {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(course.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(course.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Link href={route('admin.courses.edit', course.id)} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course Details
                      </Button>
                    </Link>
                    <Link href={route('admin.courses.enrollments', course.id)} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Enrollments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Course Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Course Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
