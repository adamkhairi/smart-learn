import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { Course, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { UserRoleBadge } from '@/components/user-role-badge';

// No custom Enrollment/EditUser interfaces needed for this approach

interface Props {
    user: User & {
        mobile?: string;
        enrollments: (Course & {
            pivot: {
                enrolled_as: 'student' | 'instructor' | 'admin';
                created_at: string;
            };
        })[];
        created_courses: Course[];
    };
    availableCourses: Course[];
}

export default function EditUser({ user, availableCourses }: Props) {
    const [newCourseId, setNewCourseId] = useState<string>('');
    const [newCourseRole, setNewCourseRole] = useState<string>('student');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Initialize toast notifications
    const { success, error } = useToast();
    const { confirm, confirmDialog } = useConfirmDialog();

    const {
        data,
        setData,
        put,
        processing,
        errors: formErrors,
    } = useForm({
        name: user.name,
        email: user.email,
        username: user.username,
        password: '',
        password_confirmation: '',
        role: user.role,
        mobile: user.mobile || '',
        is_active: user.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const handleAssignCourse = () => {
        if (!newCourseId || !newCourseRole) return;

        const courseName = availableCourses.find((c) => c.id.toString() === newCourseId)?.name || 'course';

        router.post(
            route('admin.users.assign-course', user.id),
            {
                course_id: parseInt(newCourseId),
                role: newCourseRole,
            },
            {
                onSuccess: () => {
                    setNewCourseId('');
                    setNewCourseRole('student');
                    setSearchTerm('');
                    success(`${user.name} has been assigned to ${courseName} successfully!`);
                },
                onError: () => {
                    error('Failed to assign user to course. Please try again.');
                },
            },
        );
    };

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

    const handleUpdateCourseRole = (courseId: number, role: string) => {
        const courseName = user.enrollments.find((c) => c.id === courseId)?.name || 'course';

        router.patch(
            route('admin.users.update-course-role', user.id),
            {
                course_id: courseId,
                role: role,
            },
            {
                onSuccess: () => {
                    success(`${user.name}'s role in ${courseName} has been updated to ${role}.`);
                },
                onError: () => {
                    error('Failed to update user role. Please try again.');
                },
            },
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppLayout>
            <Head title={`Edit User - ${user.name}`} />

            <div className="space-y-6 pt-4">
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
                            <Avatar>
                                <AvatarImage src={user.photo ?? undefined} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                                <p className="text-muted-foreground">
                                    {user.name} ({user.email})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Information Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={formErrors.name ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={formErrors.email ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.email} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className={formErrors.username ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.username} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input
                                            id="mobile"
                                            type="tel"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                            className={formErrors.mobile ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.mobile} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Leave blank to keep current"
                                            className={formErrors.password ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={formErrors.password_confirmation ? 'border-red-500' : ''}
                                        />
                                        <InputError message={formErrors.password_confirmation} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role *</Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) => setData('role', value as 'admin' | 'instructor' | 'student')}
                                        >
                                            <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="instructor">Instructor</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={formErrors.role} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Account Status</Label>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            />
                                            <Label htmlFor="is_active" className="text-sm font-normal">
                                                Active account
                                            </Label>
                                        </div>
                                        <InputError message={formErrors.is_active} />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <Link href={route('admin.users.index')}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Course Assignments */}
                    <div className="space-y-6">
                        {/* Current Enrollments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Enrollments ({user.enrollments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {user.enrollments.length > 0 ? (
                                        user.enrollments.map((course) => (
                                            <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate font-medium">{course.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <UserRoleBadge role={course.pivot?.enrolled_as || 'student'} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={course.pivot?.enrolled_as}
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
                                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveCourse(course.id, course.name)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-muted-foreground">No course enrollments</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assign to New Course */}
                        {availableCourses.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assign to Course</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Search for courses */}
                                        <div className="space-y-2">
                                            <Label>Search Courses</Label>
                                            <div className="relative">
                                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search courses..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>
                                                    Course (
                                                    {
                                                        availableCourses.filter(
                                                            (course) =>
                                                                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                (course.description &&
                                                                    course.description.toLowerCase().includes(searchTerm.toLowerCase())),
                                                        ).length
                                                    }{' '}
                                                    found)
                                                </Label>
                                                <Select value={newCourseId} onValueChange={setNewCourseId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select course" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableCourses
                                                            .filter(
                                                                (course) =>
                                                                    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                    (course.description &&
                                                                        course.description.toLowerCase().includes(searchTerm.toLowerCase())),
                                                            )
                                                            .map((course) => (
                                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                                    <div>
                                                                        <div className="font-medium">{course.name}</div>
                                                                        <div className="max-w-60 truncate text-xs text-muted-foreground">
                                                                            {course.description}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Select value={newCourseRole} onValueChange={setNewCourseRole}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="instructor">Instructor</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button onClick={handleAssignCourse} disabled={!newCourseId || !newCourseRole} className="w-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Assign to Course
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {availableCourses.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground">User is enrolled in all available courses</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog}
        </AppLayout>
    );
}
