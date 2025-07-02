import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';

interface Props {
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export default function CreateUser({ flash, errors }: Props) {
    const { data, setData, post, processing, errors: formErrors } = useForm<{
        name: string;
        email: string;
        username: string;
        password: string;
        password_confirmation: string;
        role: string;
        mobile: string;
        is_active: boolean;
    }>({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        mobile: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AppLayout>
            <Head title="Create User" />

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.users.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
                            <p className="text-muted-foreground">
                                Add a new user to the system
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card className="w-full">
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
                                        placeholder="Enter full name"
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
                                        placeholder="Enter email address"
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
                                        placeholder="Enter username (optional)"
                                        className={formErrors.username ? 'border-red-500' : ''}
                                    />
                                    <InputError message={formErrors.username} />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to auto-generate from name
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        value={data.mobile}
                                        onChange={(e) => setData('mobile', e.target.value)}
                                        placeholder="Enter mobile number"
                                        className={formErrors.mobile ? 'border-red-500' : ''}
                                    />
                                    <InputError message={formErrors.mobile} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        className={formErrors.password ? 'border-red-500' : ''}
                                    />
                                    <InputError message={formErrors.password} />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum 8 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        className={formErrors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    <InputError message={formErrors.password_confirmation} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger className={formErrors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="instructor">Instructor</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={formErrors.role} />
                                    <p className="text-xs text-muted-foreground">
                                        Student: Can enroll in courses • Instructor: Can create courses • Admin: Full access
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Account Status</Label>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked === true)}
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-normal">
                                            Active account
                                        </Label>
                                    </div>
                                    <InputError message={formErrors.is_active} />
                                    <p className="text-xs text-muted-foreground">
                                        Inactive users cannot login
                                    </p>
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
                                    {processing ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
