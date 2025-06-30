import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
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
    TrendingUp
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

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: 'admin' | 'instructor' | 'student';
    is_active: boolean;
    photo: string;
    created_at: string;
    enrollments_count: number;
    created_courses_count: number;
    submissions_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
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
}

export default function UsersIndex({ users, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleSearch = () => {
        const searchParams: Record<string, string> = { search };

        if (roleFilter !== 'all') {
            searchParams.role = roleFilter;
        }

        if (statusFilter !== 'all') {
            searchParams.status = statusFilter;
        }

        router.get(route('admin.users.index'), searchParams, { preserveState: true });
    };

    const handleToggleActive = (userId: number) => {
        router.patch(route('admin.users.toggle-active', userId));
    };

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.users.destroy', userId));
        }
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

    return (
        <AppSidebarLayout>
            <Head title="User Management" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
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
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch} size="sm">
                                        <Search className="h-4 w-4" />
                                    </Button>
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
                            <div className="flex items-end">
                                <Button onClick={handleSearch} className="w-full">
                                    Apply Filters
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
                        <div className="space-y-4">
                            {users.data.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={user.photo} />
                                            <AvatarFallback>
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                            <div className="text-xs text-muted-foreground">@{user.username}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
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
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
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
                                                <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
                                                    {user.is_active ? (
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
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    {users.links.map((link: PaginationLink, index: number) => (
                                        link.url ? (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-background border hover:bg-accent'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <span
                                                key={index}
                                                className="px-3 py-2 text-sm rounded-md bg-muted text-muted-foreground cursor-not-allowed"
                                            >
                                                {link.label}
                                            </span>
                                        )
                                    ))}
                                </nav>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
