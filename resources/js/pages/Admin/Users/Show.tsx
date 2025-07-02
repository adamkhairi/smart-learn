import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Calendar,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';

interface Course {
    id: number;
    name: string;
    description: string;
    pivot: {
        enrolled_as: string;
        created_at: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: 'admin' | 'instructor' | 'student';
    is_active: boolean;
    mobile: string;
    photo: string;
    created_at: string;
    last_seen_at: string;
    enrollments: Course[];
    created_courses: Course[];
    instructor_courses: Course[];
    admin_courses: Course[];
    submissions: Record<string, unknown>[];
    articles: Record<string, unknown>[];
    followers: Record<string, unknown>[];
    follows: Record<string, unknown>[];
}

interface Stats {
    courses_created: number;
    courses_enrolled: number;
    courses_teaching: number;
    assignments_submitted: number;
    articles_published: number;
    followers_count: number;
    following_count: number;
}

interface Props {
    user: User;
    stats: Stats;
}

export default function ShowUser({ user, stats }: Props) {

    const handleRemoveCourse = (courseId: number) => {
        router.delete(route('admin.users.remove-course', user.id), {
            data: { course_id: courseId },
        });
    };

    const handleUpdateCourseRole = (courseId: number, role: string) => {
        router.patch(route('admin.users.update-course-role', user.id), {
            course_id: courseId,
            role: role,
        });
    };

    const getRoleBadge = (role: string) => {
        if (role === 'admin') {
            return <Badge variant="destructive">{role}</Badge>;
        } else if (role === 'instructor') {
            return <Badge variant="default">{role}</Badge>;
        } else {
            return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title={`User Details - ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.users.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.photo} />
                                <AvatarFallback className="text-lg">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-muted-foreground">@{user.username}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {getRoleBadge(user.role)}
                                    {getStatusBadge(user.is_active)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href={route('admin.users.edit', user.id)}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                {user.mobile && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Mobile</p>
                                            <p className="text-sm text-muted-foreground">{user.mobile}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                                    </div>
                                </div>
                                {user.last_seen_at && (
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Last Seen</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(user.last_seen_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.courses_created}</div>
                                        <div className="text-xs text-muted-foreground">Courses Created</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.courses_enrolled}</div>
                                        <div className="text-xs text-muted-foreground">Courses Enrolled</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.courses_teaching}</div>
                                        <div className="text-xs text-muted-foreground">Teaching</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.assignments_submitted}</div>
                                        <div className="text-xs text-muted-foreground">Submissions</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.articles_published}</div>
                                        <div className="text-xs text-muted-foreground">Articles</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{stats.followers_count}</div>
                                        <div className="text-xs text-muted-foreground">Followers</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Enrollments */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Enrollments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.enrollments.length > 0 ? (
                                        user.enrollments.map((course) => (
                                            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{course.name}</div>
                                                    <div className="text-sm text-muted-foreground">{course.description}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Enrolled: {formatDate(course.pivot.created_at)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={course.pivot.enrolled_as}
                                                        onValueChange={(value) => handleUpdateCourseRole(course.id, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="student">Student</SelectItem>
                                                            <SelectItem value="instructor">Instructor</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveCourse(course.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">
                                            No course enrollments
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Management Notice */}
                        <Card>
                            <CardContent className="text-center py-6">
                                <p className="text-muted-foreground mb-4">
                                    Need to assign this user to new courses or manage their enrollments?
                                </p>
                                <Link href={route('admin.users.edit', user.id)}>
                                    <Button>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit User
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
