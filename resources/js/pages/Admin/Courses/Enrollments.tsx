import { Head, router, Link } from '@inertiajs/react';
import { ArrowLeft, Filter, Plus, Search, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { CourseEnrollmentRoleBadge } from '@/components/course-enrollment-role-badge';
import useDebounce from '@/hooks/use-debounce'; // Assuming this hook exists
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'; // Import Collapsible components

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: User[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    course: Course;
    enrolledUsers: PaginatedUsers;
    availableUsers: PaginatedUsers;
    filters: {
        search: string;
        role_filter: string;
    };
}

export default function Enrollments({ course, enrolledUsers, availableUsers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role_filter || 'all');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [enrollRole, setEnrollRole] = useState('student');
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [isEnrolledUsersOpen, setIsEnrolledUsersOpen] = useState(false); // State for enrolled users collapsible

    const { confirm } = useConfirmDialog();

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const debouncedSearch = useDebounce(search, 300);
    const debouncedRoleFilter = useDebounce(roleFilter, 300);

    useEffect(() => {
        router.get(
            route('admin.courses.enrollments', course.id),
            {
                search: debouncedSearch,
                role_filter: debouncedRoleFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }, [debouncedSearch, debouncedRoleFilter]);

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers((prev) => [...prev, userId]);
        } else {
            setSelectedUsers((prev) => prev.filter((id) => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(enrolledUsers.data.map((user) => user.id));
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
                    setSelectedUsers([]);
                    setIsEnrollDialogOpen(false);
                },
                onError: () => {
                    // Handle error
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
                        setSelectedUsers([]);
                    },
                    onError: () => {
                        // Handle error
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
            }
        );
    };

    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Courses', href: '/admin/courses' },
        { title: course.name, href: `/admin/courses/${course.id}` },
        { title: 'Enrollments', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
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
                                            {availableUsers.data.length > 0 ? (
                                                availableUsers.data.map((user) => (
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
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No available users to enroll.</p>
                                            )}
                                        </div>
                                        {availableUsers.links.length > 3 && (
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                {availableUsers.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url ? `${link.url}&enrolled_page=${enrolledUsers.current_page}` : '#'}
                                                        className={`px-3 py-1 rounded-md text-sm ${
                                                            link.active
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-muted-foreground hover:bg-muted'
                                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        preserveScroll
                                                        preserveState
                                                    />
                                                ))}
                                            </div>
                                        )}
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
                                <div className="relative">
                                    <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
                                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <Collapsible open={isEnrolledUsersOpen} onOpenChange={setIsEnrolledUsersOpen}>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex-1">
                                    <CardTitle>Enrolled Users ({enrolledUsers.total})</CardTitle>
                                    <CardDescription>Users currently enrolled in this course</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedUsers.length > 0 && (
                                        <Button variant="destructive" onClick={handleUnenrollUsers}>
                                            <X className="mr-2 h-4 w-4" />
                                            Unenroll {selectedUsers.length} Users
                                        </Button>
                                    )}
                                    {isEnrolledUsersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent>
                                {enrolledUsers.data.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Select All */}
                                        <div className="flex items-center space-x-2 rounded border p-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedUsers.length === enrolledUsers.data.length && enrolledUsers.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <Label htmlFor="select-all" className="text-sm font-medium">
                                                Select All ({enrolledUsers.data.length})
                                            </Label>
                                        </div>

                                        {/* Users List */}
                                        <div className="grid gap-3">
                                            {enrolledUsers.data.map((user) => (
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
                                        {/* Pagination for Enrolled Users */}
                                        {enrolledUsers.links.length > 3 && (
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                {enrolledUsers.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url ? `${link.url}&available_page=${availableUsers.current_page}` : '#'}
                                                        className={`px-3 py-1 rounded-md text-sm ${
                                                            link.active
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-muted-foreground hover:bg-muted'
                                                        } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        preserveScroll
                                                        preserveState
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No enrolled users found</p>
                                    </div>
                                )}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* Available Users */}
                {availableUsers.total > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Users ({availableUsers.total})</CardTitle>
                            <CardDescription>Users not yet enrolled in this course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {availableUsers.data.map((user) => (
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
                            {/* Pagination for Available Users */}
                            {availableUsers.links.length > 3 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    {availableUsers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ? `${link.url}&enrolled_page=${enrolledUsers.current_page}` : '#'}
                                            className={`px-3 py-1 rounded-md text-sm ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'text-muted-foreground hover:bg-muted'
                                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                            preserveState
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
