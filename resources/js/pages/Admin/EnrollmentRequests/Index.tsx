import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Filter } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useDebounce from '@/hooks/use-debounce';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { BreadcrumbItem, PaginatedResponse, Course, User } from '@/types';

interface EnrollmentRequest {
    id: number;
    user_id: number;
    course_id: number;
    status: 'pending' | 'approved' | 'rejected';
    message?: string;
    created_at: string;
    updated_at: string;
    user: User;
    course: Course;
}

interface EnrollmentRequestsIndexProps {
    enrollmentRequests: PaginatedResponse<EnrollmentRequest>;
    filters: {
        status?: 'all' | 'pending' | 'approved' | 'rejected';
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Enrollment Requests',
        href: '#',
    },
];

export default function EnrollmentRequestsIndex({ enrollmentRequests, filters }: EnrollmentRequestsIndexProps) {
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const debouncedStatusFilter = useDebounce(statusFilter, 500);

    const { confirm, confirmDialog } = useConfirmDialog();

    useEffect(() => {
        if (debouncedStatusFilter !== filters.status) {
            router.get(
                route('admin.enrollment-requests.index'),
                { status: debouncedStatusFilter },
                { preserveState: true, preserveScroll: true },
            );
        }
    }, [debouncedStatusFilter]);

    const handleApprove = (request: EnrollmentRequest) => {
        confirm({
            title: 'Approve Enrollment Request',
            description: `Are you sure you want to approve the enrollment request for "${request.user.name}" in "${request.course.name}"?`,
            confirmText: 'Approve',
            variant: 'default',
            onConfirm: () => {
                router.post(route('admin.enrollment-requests.approve', request.id), {});
            },
        });
    };

    const handleReject = (request: EnrollmentRequest) => {
        confirm({
            title: 'Reject Enrollment Request',
            description: `Are you sure you want to reject the enrollment request for "${request.user.name}" in "${request.course.name}"?`,
            confirmText: 'Reject',
            variant: 'destructive',
            onConfirm: () => {
                router.post(route('admin.enrollment-requests.reject', request.id), {});
            },
        });
    };

    const getStatusBadgeVariant = (status: EnrollmentRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'outline';
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrollment Requests" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Enrollment Requests</h1>
                        <p className="text-muted-foreground">Manage pending course enrollment requests from users</p>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'pending' | 'approved' | 'rejected')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enrollment Requests List */}
                <Card>
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Requested At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollmentRequests.data.length > 0 ? (
                                    enrollmentRequests.data.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.user.name}</TableCell>
                                            <TableCell>{request.course.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{request.message || 'N/A'}</TableCell>
                                            <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(request)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(request)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No actions</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No enrollment requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {enrollmentRequests.meta?.last_page && enrollmentRequests.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(enrollmentRequests.meta.current_page - 1) * enrollmentRequests.meta.per_page + 1} to{' '}
                            {Math.min(enrollmentRequests.meta.current_page * enrollmentRequests.meta.per_page, enrollmentRequests.meta.total)} of {enrollmentRequests.meta.total} requests
                        </p>

                        <div className="flex gap-2">
                            {enrollmentRequests.links.map((link, index) => (
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
