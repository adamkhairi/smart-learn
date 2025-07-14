import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { SimplePaginatedResponse, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, BookOpen, Edit, Eye, Filter, MoreHorizontal, Plus, Trash2, TrendingUp, UserCheck, UserX, Users } from 'lucide-react';
import useDebounce from '@/hooks/use-debounce';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface IndexUser extends User {
    enrollments_count: number;
    created_courses_count: number;
    submissions_count: number;
}

interface Props {
    users: SimplePaginatedResponse<IndexUser>;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    stats: {
        total_users: number;
        active_users: number;
        instructors: number;
        admins: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export default function UsersIndex({ users, filters, stats, flash, errors }: Props) {
    // Initialize toast notifications
    const { success: showSuccess, error: showError } = useToast();

    // Initialize confirmation dialog
    const { confirm, confirmDialog } = useConfirmDialog();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedRoleFilter = useDebounce(roleFilter, 500);
    const debouncedStatusFilter = useDebounce(statusFilter, 500);

    useEffect(() => {
        const searchParams: Record<string, string> = {};

        if (debouncedSearch.trim()) {
            searchParams.search = debouncedSearch.trim();
        }

        if (debouncedRoleFilter !== 'all') {
            searchParams.role = debouncedRoleFilter;
        }

        if (debouncedStatusFilter !== 'all') {
            searchParams.status = debouncedStatusFilter;
        }

        router.get(route('admin.users.index'), searchParams, {
            preserveState: true,
            onFinish: () => {},
        });
    }, [debouncedSearch, debouncedRoleFilter, debouncedStatusFilter]);

    const handleToggleActive = (userId: number, userName: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        const actionPast = isActive ? 'deactivated' : 'activated';
        confirm({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            description: `Are you sure you want to ${action} ${userName}?`,
            confirmText: `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            variant: 'default',
            onConfirm: () => {
                setTogglingUserId(userId);
                router.patch(
                    route('admin.users.toggle-active', userId),
                    {},
                    {
                        onSuccess: () => {
                            showSuccess(`User ${actionPast} successfully.`);
                        },
                        onError: () => {
                            showError('Failed to update user status. Please try again.');
                        },
                        onFinish: () => setTogglingUserId(null),
                    },
                );
            },
        });
    };

    const handleDelete = (userId: number, userName: string) => {
        confirm({
            title: 'Delete User',
            description: `Are you sure you want to delete ${userName}? This action cannot be undone and will permanently remove all associated data.`,
            confirmText: 'Yes, Delete User',
            variant: 'destructive',
            onConfirm: () => {
                setDeletingUserId(userId);
                router.delete(route('admin.users.destroy', userId), {
                    onSuccess: () => {
                        showSuccess('User deleted successfully.');
                    },
                    onError: () => {
                        showError('Failed to delete user. Please try again.');
                    },
                    onFinish: () => setDeletingUserId(null),
                });
            },
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
        router.get(route('admin.users.index')); // This will be handled by useEffect due to debounced filters
    };

    const getRoleBadge = (role: string) => {
        const config = {
            admin: { variant: 'destructive' as const, label: 'Admin' },
            instructor: { variant: 'default' as const, label: 'Instructor' },
            student: { variant: 'secondary' as const, label: 'Student' },
        };
        const { variant, label } = config[role as keyof typeof config] || config.student;
        return <Badge variant={variant}>{label}</Badge>;
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                Inactive
            </Badge>
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
            <Head title="User Management" />

            <div className="space-y-6 pt-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {(flash?.error || errors?.error) && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash?.error || errors?.error}</AlertDescription>
                    </Alert>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">Manage users, roles, and course assignments</p>
                    </div>
                    <Link href={route('admin.users.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_users}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.instructors}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.admins}</div>
                        </CardContent>
                    </Card>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button onClick={clearFilters} variant="outline" className="w-full">
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Courses Created</TableHead>
                                    <TableHead>Enrollments</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={user.photo || ''} alt={user.name} />
                                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        {user.username && (
                                                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                                            <TableCell>{user.created_courses_count}</TableCell>
                                            <TableCell>{user.enrollments_count}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>User actions</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.users.edit', user.id)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.users.show', user.id)}>
                                                                <Eye className="mr-2 h-4 w-4" /> View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleActive(user.id, user.name, user.is_active)}
                                                            className={user.is_active ? 'text-yellow-600 focus:text-yellow-600' : 'text-green-600 focus:text-green-600'}
                                                            disabled={togglingUserId === user.id}
                                                        >
                                                            {user.is_active ? (
                                                                <>
                                                                    <UserX className="mr-2 h-4 w-4" /> Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-2 h-4 w-4" /> Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(user.id, user.name)}
                                                            className="text-destructive focus:text-destructive"
                                                            disabled={deletingUserId === user.id}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users?.links?.length > 3 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(users.current_page - 1) * users.per_page + 1} to{' '}
                            {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                        </p>

                        <div className="flex gap-2">
                            {users.links.map((link, index) => (
                                <React.Fragment key={index}>
                                    {link.url === null ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(link.url!)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {confirmDialog}
        </AppLayout>
    );
}
