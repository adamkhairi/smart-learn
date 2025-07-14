import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Filter, Plus, Search, Users, X } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Course, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { CourseEnrollmentRoleBadge } from '@/components/course-enrollment-role-badge';

interface Props {
    course: Course;
    enrolledUsers: User[];
    availableUsers: User[];
}

export default function Enrollments({ course, enrolledUsers, availableUsers }: Props) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [enrollRole, setEnrollRole] = useState('student');
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

    // Initialize toast and confirmation dialog
    const { success, error } = useToast();
    const { confirm } = useConfirmDialog();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const filteredEnrolledUsers = enrolledUsers.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.pivot?.enrolled_as === roleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredAvailableUsers = availableUsers.filter((user) => {
        return user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    });

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, userId]);
        } else {
            setSelectedUsers((prev) => prev.filter((id) => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(filteredEnrolledUsers.map((user) => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleEnrollUsers = () => {
        if (selectedUsers.length === 0) return;

        router.post(
            route('admin.courses.enroll-users', course.id),
            {
                user_ids: selectedUsers,
                role: enrollRole,
            },
            {
                onSuccess: () => {
                    success(`Successfully enrolled ${selectedUsers.length} user(s).`);
                    setSelectedUsers([]);
                    setIsEnrollDialogOpen(false);
                },
                onError: () => {
                    error('Failed to enroll users. Please try again.');
                },
            },
        );
    };

    const handleUnenrollUsers = () => {
        if (selectedUsers.length === 0) return;

        confirm({
            title: 'Unenroll Users',
            description: `Are you sure you want to unenroll ${selectedUsers.length} user(s) from this course?`,
            variant: 'destructive',
            confirmText: 'Unenroll',
            onConfirm: () => {
                router.delete(route('admin.courses.unenroll-users', course.id), {
                    data: { user_ids: selectedUsers },
                    onSuccess: () => {
                        success(`Successfully unenrolled ${selectedUsers.length} user(s).`);
                        setSelectedUsers([]);
                    },
                    onError: () => {
                        error('Failed to unenroll users. Please try again.');
                    },
                });
            },
        });
    };

    const handleUpdateRole = (userId: number, newRole: string) => {
        router.patch(
            route('admin.users.update-course-role', userId),
            {
                course_id: course.id,
                role: newRole,
            },
            {
                onSuccess: () => {
                    success('User role updated successfully.');
                },
                onError: () => {
                    error('Failed to update user role. Please try again.');
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`${course.name} - Enrollments`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{course.name} Enrollments</h1>
                            <p className="text-muted-foreground">Manage user enrollments and roles</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Enroll Users
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Enroll Users</DialogTitle>
                                    <DialogDescription>Select users to enroll in this course</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={enrollRole} onValueChange={setEnrollRole}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="instructor">Instructor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Available Users</Label>
                                        <div className="max-h-60 space-y-2 overflow-y-auto">
                                            {filteredAvailableUsers.map((user) => (
                                                <div key={user.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`enroll-${user.id}`}
                                                        checked={selectedUsers.includes(user.id)}
                                                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                    />
                                                    <Label htmlFor={`enroll-${user.id}`} className="flex cursor-pointer items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">({user.email})</span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleEnrollUsers} disabled={selectedUsers.length === 0}>
                                            Enroll {selectedUsers.length} Users
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Search Users</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Filter by Role</Label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="student">Students</SelectItem>
                                        <SelectItem value="instructor">Instructors</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enrolled Users */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Enrolled Users ({filteredEnrolledUsers.length})</CardTitle>
                                <CardDescription>Users currently enrolled in this course</CardDescription>
                            </div>
                            {selectedUsers.length > 0 && (
                                <Button variant="destructive" onClick={handleUnenrollUsers}>
                                    <X className="mr-2 h-4 w-4" />
                                    Unenroll {selectedUsers.length} Users
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredEnrolledUsers.length > 0 ? (
                            <div className="space-y-4">
                                {/* Select All */}
                                <div className="flex items-center space-x-2 rounded border p-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedUsers.length === filteredEnrolledUsers.length && filteredEnrolledUsers.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor="select-all" className="text-sm font-medium">
                                        Select All ({filteredEnrolledUsers.length})
                                    </Label>
                                </div>

                                {/* Users List */}
                                <div className="grid gap-3">
                                    {filteredEnrolledUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between rounded border p-3">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                                                />
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={user.pivot?.enrolled_as || 'student'}
                                                    onValueChange={(value) => handleUpdateRole(user.id, value)}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="instructor">Instructor</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="text-xs text-muted-foreground">
                                                    Enrolled {new Date(user.pivot?.created_at || '').toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">No enrolled users found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Users */}
                {filteredAvailableUsers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Users ({filteredAvailableUsers.length})</CardTitle>
                            <CardDescription>Users not yet enrolled in this course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {filteredAvailableUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between rounded border p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CourseEnrollmentRoleBadge role={user.role} />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUsers([user.id]);
                                                    setEnrollRole('student');
                                                    setIsEnrollDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Enroll
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
