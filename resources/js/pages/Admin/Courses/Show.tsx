import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    BarChart3,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    GraduationCap,
    MessageSquare,
    MoreHorizontal,
    Plus,
    Search,
    Settings,
    Share2,
    Target,
    Trash2,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Course } from '@/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CourseStatusBadge } from '@/components/course-status-badge';
import { CourseRoleBadge } from '@/components/course-role-badge';

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
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
            <div className={`rounded-full p-2 ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
        );
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        color,
        change,
    }: {
        title: string;
        value: number;
        icon: React.ElementType;
        color: string;
        change?: number;
    }) => (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        {change !== undefined && (
                            <div className="mt-1 flex items-center">
                                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600">+{change}% from last month</span>
                            </div>
                        )}
                    </div>
                    <div className={`rounded-full p-3 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const filteredUsers = (course.enrolled_users || []).filter(
        (user) =>
            user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(searchUsers.toLowerCase())),
    );

    return (
        <AppLayout>
            <Head title={course.name} />

            <div className="space-y-6">
                {/* Enhanced Header */}
                <div className="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-6 dark:from-red-950 dark:to-red-900">
                    <div className="mb-4 flex items-center justify-between">
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

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg text-3xl font-bold text-white"
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
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
                                    <CourseStatusBadge status={course.status} />
                                </div>
                                <p className="max-w-2xl text-muted-foreground">{course.description}</p>
                                <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">{course.creator ? getInitials(course.creator.name) : '?'}</AvatarFallback>
                                    </Avatar>
                                    <span>Created by {course.creator?.name || 'Unknown Creator'}</span>
                                    <Separator orientation="vertical" className="h-4" />
                                    <Calendar className="h-4 w-4" />
                                    <span>Created on {new Date(course.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-2">
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

                {/* Enhanced Statistics Dashboard */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <StatCard title="Total Students" value={stats.total_students} icon={GraduationCap} color="text-blue-600" change={12} />
                    <StatCard title="Instructors" value={stats.total_instructors} icon={Users} color="text-purple-600" change={5} />
                    <StatCard title="Modules" value={stats.total_modules} icon={BookOpen} color="text-green-600" />
                    <StatCard title="Assignments" value={stats.total_assignments} icon={Target} color="text-orange-600" />
                    <StatCard title="Assessments" value={stats.total_assessments} icon={FileText} color="text-blue-600" />
                    <StatCard title="Discussions" value={stats.total_discussions} icon={MessageSquare} color="text-green-600" />
                </div>

                {/* Main Content with Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
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
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Course Description */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Course Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="leading-relaxed text-muted-foreground">
                                            {course.description ||
                                                'No description available for this course. Consider adding a detailed description to help students understand what they will learn.'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Content Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Content Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm font-medium">Published Modules</span>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {stats.total_published_modules}/{stats.total_modules}
                                                </span>
                                            </div>
                                            <Progress
                                                value={stats.total_modules > 0 ? (stats.total_published_modules / stats.total_modules) * 100 : 0}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="rounded-lg border p-3 text-center">
                                                <p className="text-lg font-bold text-green-600">{stats.total_modules}</p>
                                                <p className="text-xs text-muted-foreground">Total Modules</p>
                                            </div>
                                            <div className="rounded-lg border p-3 text-center">
                                                <p className="text-lg font-bold text-orange-600">{stats.total_assignments}</p>
                                                <p className="text-xs text-muted-foreground">Assignments</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        Performance Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950">
                                            <p className="text-2xl font-bold text-blue-600">{stats.enrollment_rate}%</p>
                                            <p className="text-sm text-muted-foreground">Enrollment Rate</p>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
                                            <p className="text-2xl font-bold text-green-600">{stats.completion_rate}%</p>
                                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-orange-600" />
                                        Communication Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950">
                                            <p className="text-2xl font-bold text-orange-600">{stats.total_announcements}</p>
                                            <p className="text-sm text-muted-foreground">Announcements</p>
                                        </div>
                                        <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950">
                                            <p className="text-2xl font-bold text-purple-600">{stats.total_discussions}</p>
                                            <p className="text-sm text-muted-foreground">Active Discussions</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-6">
                        {/* Content Management Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Course Content Management</h3>
                                <p className="text-muted-foreground">Manage modules, assignments, assessments, and discussions</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Content
                                </Button>
                                <Button size="sm" variant="outline">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Bulk Publish
                                </Button>
                            </div>
                        </div>

                        {/* Content Status Overview */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="border-l-4 border-l-blue-500 transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-blue-600" />
                                                <p className="text-sm font-medium text-muted-foreground">Module Status</p>
                                            </div>
                                            <p className="text-lg font-bold">
                                                {stats.total_published_modules}/{course.modules?.length || 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Published/Total</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                <span className="text-sm font-bold text-blue-600">
                                                    {(course.modules?.length || 0) > 0
                                                        ? Math.round((stats.total_published_modules / (course.modules?.length || 0)) * 100)
                                                        : 0}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-orange-500 transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <Target className="h-4 w-4 text-orange-600" />
                                                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                                            </div>
                                            <p className="text-lg font-bold">
                                                {(course.assignments?.length || 0) + (course.assessments?.length || 0)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Assignments + Assessments</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                                                {course.assignments?.length || 0} + {course.assessments?.length || 0}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-green-500 transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-green-600" />
                                                <p className="text-sm font-medium text-muted-foreground">Communication</p>
                                            </div>
                                            <p className="text-lg font-bold">{course.discussions?.length || 0}</p>
                                            <p className="text-xs text-muted-foreground">Active Discussions</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                                <MessageSquare className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-purple-500 transition-shadow hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-purple-600" />
                                                <p className="text-sm font-medium text-muted-foreground">Updates</p>
                                            </div>
                                            <p className="text-lg font-bold">{course.announcements?.length || 0}</p>
                                            <p className="text-xs text-muted-foreground">Recent Announcements</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                                                <Bell className="h-5 w-5 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content Management Tabs */}
                        <Tabs defaultValue="modules" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="modules">Modules</TabsTrigger>
                                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                            </TabsList>

                            {/* Modules Management */}
                            <TabsContent value="modules" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-5 w-5" />
                                                <CardTitle>Course Modules ({course.modules?.length || 0})</CardTitle>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview All
                                                </Button>
                                                <Link href={`/courses/${course.id}/modules/create`}>
                                                    <Button size="sm">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Module
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {(course.modules?.length || 0) > 0 ? (
                                            <div className="space-y-4">
                                                {(course.modules || []).map((module, index) => (
                                                    <Card key={module.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-lg font-semibold">{module.title}</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant={module.is_published ? 'default' : 'secondary'}>
                                                                                {module.is_published ? (
                                                                                    <>
                                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                                        Published
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Clock className="mr-1 h-3 w-3" />
                                                                                        Draft
                                                                                    </>
                                                                                )}
                                                                            </Badge>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="sm">
                                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end">
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                                            View Details
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link
                                                                                            href={`/courses/${course.id}/modules/${module.id}/edit`}
                                                                                        >
                                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                                            Edit Module
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem>
                                                                                        {module.is_published ? (
                                                                                            <>
                                                                                                <AlertCircle className="mr-2 h-4 w-4" />
                                                                                                Unpublish
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                                                Publish
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem className="text-red-600">
                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                        Delete Module
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span className="flex items-center gap-1">
                                                                            <FileText className="h-3 w-3" />
                                                                            {module.module_items?.length || 0} items
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />~
                                                                            {Math.max(1, Math.ceil(((module.module_items?.length || 0) * 15) / 60))}h
                                                                            duration
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />
                                                                            {stats.total_students} students
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                                                            <Button size="sm" variant="outline">
                                                                                <Plus className="mr-2 h-4 w-4" />
                                                                                Add Content
                                                                            </Button>
                                                                        </Link>
                                                                        <Button size="sm" variant="outline">
                                                                            <BarChart3 className="mr-2 h-4 w-4" />
                                                                            View Analytics
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                                <h3 className="mb-2 text-lg font-semibold">No modules created yet</h3>
                                                <p className="mb-4 text-muted-foreground">Start building your course by creating the first module</p>
                                                <Link href={`/courses/${course.id}/modules/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Module
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Assignments Management */}
                            <TabsContent value="assignments" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-5 w-5" />
                                                <CardTitle>Course Assignments ({course.assignments?.length || 0})</CardTitle>
                                            </div>
                                            <Link href={`/courses/${course.id}/assignments/create`}>
                                                <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Assignment
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {(course.assignments?.length || 0) > 0 ? (
                                            <div className="space-y-4">
                                                {(course.assignments || []).map((assignment) => (
                                                    <Card key={assignment.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-lg font-semibold">{assignment.title}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            Due:{' '}
                                                                            {assignment.expired_at
                                                                                ? new Date(assignment.expired_at).toLocaleDateString()
                                                                                : 'N/A'}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />0 submissions
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="outline">Active</Badge>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                View Submissions
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit Assignment
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                                                View Analytics
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem className="text-red-600">
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete Assignment
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                                <h3 className="mb-2 text-lg font-semibold">No assignments created yet</h3>
                                                <p className="mb-4 text-muted-foreground">
                                                    Create assignments to assess student learning and progress
                                                </p>
                                                <Link href={`/courses/${course.id}/assignments/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Assignment
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Assessments Management */}
                            <TabsContent value="assessments" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                <CardTitle>Course Assessments ({course.assessments?.length || 0})</CardTitle>
                                            </div>
                                            <Link href={`/courses/${course.id}/assessments/create`}>
                                                <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Assessment
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {(course.assessments?.length || 0) > 0 ? (
                                            <div className="space-y-4">
                                                {(course.assessments || []).map((assessment) => (
                                                    <Card key={assessment.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-lg font-semibold">{assessment.title}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <Badge variant="secondary">{assessment.type}</Badge>
                                                                        <span className="flex items-center gap-1">
                                                                            <Users className="h-3 w-3" />0 attempts
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            Preview Assessment
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit Assessment
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <BarChart3 className="mr-2 h-4 w-4" />
                                                                            View Results
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete Assessment
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                                <h3 className="mb-2 text-lg font-semibold">No assessments created yet</h3>
                                                <p className="mb-4 text-muted-foreground">
                                                    Create quizzes and tests to evaluate student understanding
                                                </p>
                                                <Link href={`/courses/${course.id}/assessments/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Assessment
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Discussions Management */}
                            <TabsContent value="discussions" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-5 w-5" />
                                                <CardTitle>Course Discussions ({course.discussions?.length || 0})</CardTitle>
                                            </div>
                                            <Link href={`/courses/${course.id}/discussions/create`}>
                                                <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Start Discussion
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {(course.discussions?.length || 0) > 0 ? (
                                            <div className="space-y-4">
                                                {(course.discussions || []).map((discussion) => (
                                                    <Card key={discussion.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-lg font-semibold">{discussion.title}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <MessageSquare className="h-3 w-3" />0 replies
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View Discussion
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit Discussion
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Bell className="mr-2 h-4 w-4" />
                                                                            Pin Discussion
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete Discussion
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                                <h3 className="mb-2 text-lg font-semibold">No discussions started yet</h3>
                                                <p className="mb-4 text-muted-foreground">Create discussion forums to encourage student engagement</p>
                                                <Link href={`/courses/${course.id}/discussions/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Start First Discussion
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Announcements Management */}
                            <TabsContent value="announcements" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-5 w-5" />
                                                <CardTitle>Course Announcements ({course.announcements?.length || 0})</CardTitle>
                                            </div>
                                            <Link href={`/courses/${course.id}/announcements/create`}>
                                                <Button size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Announcement
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {(course.announcements?.length || 0) > 0 ? (
                                            <div className="space-y-4">
                                                {(course.announcements || []).map((announcement) => (
                                                    <Card key={announcement.id} className="transition-shadow hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-lg font-semibold">{announcement.title}</h4>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                                                        <Badge variant="outline">Published</Badge>
                                                                    </div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View Announcement
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit Announcement
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Share2 className="mr-2 h-4 w-4" />
                                                                            Send Notification
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-red-600">
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete Announcement
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Bell className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                                <h3 className="mb-2 text-lg font-semibold">No announcements yet</h3>
                                                <p className="mb-4 text-muted-foreground">
                                                    Keep students informed with important course announcements
                                                </p>
                                                <Link href={`/courses/${course.id}/announcements/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Announcement
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Enrolled Users ({course.enrolled_users?.length || 0})</CardTitle>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                            <Input
                                                placeholder="Search users..."
                                                value={searchUsers}
                                                onChange={(e) => setSearchUsers(e.target.value)}
                                                className="w-64 pl-9"
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
                                {(filteredUsers || []).length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {(filteredUsers || []).map((user) => (
                                            <Card key={user.id} className="transition-shadow hover:shadow-md">
                                                <CardContent className="p-4">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={user.photo} alt={user.name} />
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium">{user.name}</p>
                                                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <CourseRoleBadge course={course} user={user} />
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(user.pivot?.created_at || user.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
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
                                {(recentActivity || []).length > 0 ? (
                                    <div className="space-y-4">
                                        {(recentActivity || []).map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                            >
                                                {getActivityIcon(activity.type)}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium">{activity.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        by {activity.user?.name || 'Unknown'} • {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.type}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No recent activity</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Status</label>
                                            <div className="mt-1"><CourseStatusBadge status={course.status} /></div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Created</label>
                                            <p className="mt-1 text-sm text-muted-foreground">{new Date(course.created_at).toLocaleDateString()}</p>
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
