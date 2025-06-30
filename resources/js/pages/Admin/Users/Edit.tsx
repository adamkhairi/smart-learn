import React from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Course {
    id: number;
    name: string;
    description: string;
}

interface Enrollment {
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
    enrollments: Enrollment[];
    created_courses: Course[];
}

interface Props {
    user: User;
    availableCourses: Course[];
}

export default function EditUser({ user, availableCourses }: Props) {
    const { data, setData, put, processing, errors } = useForm({
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

    const handleAssignCourse = (courseId: number, role: string) => {
        router.post(route('admin.users.assign-course', user.id), {
            course_id: courseId,
            role: role,
        });
    };

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

    return (
        <>
            <Head title={`Edit User - ${user.name}`} />

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
                            <Avatar>
                                <AvatarImage src={user.photo} />
                                <AvatarFallback>
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
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
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} />
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
                                        />
                                        <InputError message={errors.username} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile</Label>
                                        <Input
                                            id="mobile"
                                            type="tel"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                        />
                                        <InputError message={errors.mobile} />
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
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role *</Label>
                                        <Select value={data.role} onValueChange={(value) => setData('role', value as 'admin' | 'instructor' | 'student')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="instructor">Instructor</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.role} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                            />
                                            <Label htmlFor="is_active" className="text-sm font-normal">
                                                Active account
                                            </Label>
                                        </div>
                                        <InputError message={errors.is_active} />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
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
                                <CardTitle>Current Course Enrollments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {user.enrollments.length > 0 ? (
                                        user.enrollments.map((course) => (
                                            <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{course.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {getRoleBadge(course.pivot.enrolled_as)}
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
                                        <p className="text-muted-foreground text-center py-4">
                                            No course enrollments
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assign to New Course */}
                        {availableCourses.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assign to New Course</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {availableCourses.map((course) => (
                                            <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-medium">{course.name}</div>
                                                    <div className="text-sm text-muted-foreground">{course.description}</div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Select onValueChange={(value) => handleAssignCourse(course.id, value)}>
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Role" />
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
                                                        onClick={() => handleAssignCourse(course.id, 'student')}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
