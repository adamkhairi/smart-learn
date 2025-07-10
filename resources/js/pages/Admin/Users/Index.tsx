import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    UserCheck,
    UserX,
    Users,
    BookOpen,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useToast } from '@/hooks/use-toast';
import { SimplePaginatedResponse, User } from '@/types';

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
    useFlashToast();

    // Initialize confirmation dialog
    const { confirm, confirmDialog } = useConfirmDialog();

    // Initialize toast for manual notifications
    const { success: showSuccess, error: showError } = useToast();

    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [loading, setLoading] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

    const handleSearch = () => {
        setLoading(true);
        const searchParams: Record<string, string> = {};

        if (search.trim()) {
            searchParams.search = search.trim();
        }

        if (roleFilter !== 'all') {
            searchParams.role = roleFilter;
        }

        if (statusFilter !== 'all') {
            searchParams.status = statusFilter;
        }

        router.get(route('admin.users.index'), searchParams, {
            preserveState: true,
            onFinish: () => setLoading(false)
        });
    };

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
                router.patch(route('admin.users.toggle-active', userId), {}, {
                    onSuccess: () => {
                        showSuccess(`User ${actionPast} successfully.`);
                    },
                    onError: () => {
                        showError('Failed to update user status. Please try again.');
                    },
                    onFinish: () => setTogglingUserId(null)
                });
            }
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
                    onFinish: () => setDeletingUserId(null)
                });
            }
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
        router.get(route('admin.users.index'));
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
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground">
                            Manage users, roles, and course assignments
                        </p>
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
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleSearch} disabled={loading} className="flex-1">
                                    <Search className="mr-2 h-4 w-4" />
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({users.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.data.length > 0 ? (
                            <div className="space-y-4">
                                {users.data.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={user.photo} />
                                                <AvatarFallback>
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    href={route('admin.users.show', user.id)}
                                                    className="font-medium hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    {user.name}
                                                </Link>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                {user.username && (
                                                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right hidden sm:block">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getRoleBadge(user.role)}
                                                    {getStatusBadge(user.is_active)}
                                                </div>
                                                <div className="text-xs text-muted-foreground space-x-4">
                                                    <span>{user.enrollments_count} enrollments</span>
                                                    <span>{user.created_courses_count} courses</span>
                                                    <span>{user.submissions_count} submissions</span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>User options</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.users.show', user.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.users.edit', user.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleActive(user.id, user.name, user.is_active)}
                                                        disabled={togglingUserId === user.id}
                                                    >
                                                        {togglingUserId === user.id ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                                                {user.is_active ? 'Deactivating...' : 'Activating...'}
                                                            </>
                                                        ) : user.is_active ? (
                                                            <>
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Activate
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        className="text-red-600"
                                                        disabled={deletingUserId === user.id}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium">No users found</p>
                                <p className="text-muted-foreground">
                                    {search || roleFilter !== 'all' || statusFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Get started by creating your first user.'}
                                </p>
                                {!(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                                    <Link href={route('admin.users.create')} className="mt-4 inline-block">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First User
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    {users.links.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background border hover:bg-accent'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={index}
                                                className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </nav>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {confirmDialog}
        </AppLayout>
    );
}
