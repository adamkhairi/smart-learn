import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Course, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, Mail, Phone, X } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserRoleBadge } from '@/components/user-role-badge';
import { UserStatusBadge } from '@/components/user-status-badge';

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
    const { confirm, confirmDialog } = useConfirmDialog();
    const { success, error } = useToast();

    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
        { title: 'Show', href: '#' },
    ];

    const handleRemoveCourse = (courseId: number, courseName: string) => {
        confirm({
            title: 'Remove User from Course',
            description: `Are you sure you want to remove ${user.name} from "${courseName}"? This action cannot be undone.`,
            variant: 'destructive',
            confirmText: 'Remove',
            onConfirm: () => {
                router.delete(route('admin.users.remove-course', user.id), {
                    data: { course_id: courseId },
                    onSuccess: () => {
                        success(`${user.name} has been removed from ${courseName} successfully.`);
                    },
                    onError: () => {
                        error('Failed to remove user from course. Please try again.');
                    },
                });
            },
        });
    };

    const handleUpdateCourseRole = (courseId: number, role: string, courseName: string) => {
        router.patch(route('admin.users.update-course-role', user.id), {
            course_id: courseId,
            role: role,
        }, {
            onSuccess: () => {
                success(`${user.name}'s role in ${courseName} has been updated to ${role}.`);
            },
            onError: () => {
                error('Failed to update user role. Please try again.');
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                                    {user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                                <p className="text-muted-foreground">@{user.username}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <UserRoleBadge role={user.role} />
                                    <UserStatusBadge isActive={user.is_active} />
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
                    <div className="space-y-6 lg:col-span-1">
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
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Enrollments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {((user.enrollments as Course[]) || []).length > 0 ? (
                                        ((user.enrollments as Course[]) || []).map((enrollment: Course) => (
                                            <div key={enrollment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                <div>
                                                    <div className="font-medium">{enrollment.name}</div>
                                                    <div className="text-sm text-muted-foreground">{enrollment.description}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        Enrolled: {enrollment.pivot ? formatDate(enrollment.pivot.created_at) : 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={enrollment.pivot?.enrolled_as}
                                                        onValueChange={(value) => handleUpdateCourseRole(enrollment.id, value, enrollment.name)}
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
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleRemoveCourse(enrollment.id, enrollment.name)}
                                                    >
                                                        <X className="mr-2 h-4 w-4" /> Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">This user is not enrolled in any courses.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Management Notice */}
                        <Card>
                            <CardContent className="py-6 text-center">
                                <p className="mb-4 text-muted-foreground">Need to assign this user to new courses or manage their enrollments?</p>
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
            {confirmDialog}
        </AppLayout>
    );
}
