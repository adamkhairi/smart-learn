import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, TrendingUp, UserCheck, Users, UserX } from 'lucide-react';
import { route } from 'ziggy-js';
import { UserRoleBadge } from '@/components/user-role-badge';

interface StatsUser extends User {
    created_courses_count: number;
}

interface RoleDistribution {
    admin: number;
    instructor: number;
    student: number;
}

interface Stats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    role_distribution: RoleDistribution;
    recent_registrations: StatsUser[];
    top_instructors: StatsUser[];
}

interface Props {
    stats: Stats;
}

export default function UserStats({ stats }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: 'Stats', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Statistics" />

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
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">User Statistics</h1>
                            <p className="text-muted-foreground">Overview of user analytics and insights</p>
                        </div>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                            <p className="text-xs text-muted-foreground">All registered users</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_users}</div>
                            <p className="text-xs text-muted-foreground">{((stats.active_users / stats.total_users) * 100).toFixed(1)}% of total</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                            <UserX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive_users}</div>
                            <p className="text-xs text-muted-foreground">{((stats.inactive_users / stats.total_users) * 100).toFixed(1)}% of total</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+12.5%</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Role Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                        <span className="text-sm font-medium">Admins</span>
                                    </div>
                                    <div className="text-sm font-bold">{stats.role_distribution.admin}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-medium">Instructors</span>
                                    </div>
                                    <div className="text-sm font-bold">{stats.role_distribution.instructor}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                                        <span className="text-sm font-medium">Students</span>
                                    </div>
                                    <div className="text-sm font-bold">{stats.role_distribution.student}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Registrations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.recent_registrations.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <UserRoleBadge role={user.role} />
                                            <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Instructors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Top Instructors
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.top_instructors.map((instructor, index) => (
                                <div key={instructor.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                            {index + 1}
                                        </div>
                                        <Avatar>
                                            <AvatarFallback>
                                                {instructor.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{instructor.name}</div>
                                            <div className="text-sm text-muted-foreground">{instructor.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{instructor.created_courses_count}</div>
                                        <div className="text-xs text-muted-foreground">Courses Created</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
