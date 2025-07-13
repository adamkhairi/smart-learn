import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Course, User } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Search, UserMinus, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';

interface CourseEnrollmentProps {
    course: Course;
    userRole: string;
}

export function CourseEnrollment({ course, userRole }: CourseEnrollmentProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [unenrollingUserId, setUnenrollingUserId] = useState<number | null>(null);

    // Initialize confirmation dialog and toast
    const { confirm, confirmDialog } = useConfirmDialog();
    const { error: showError } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        role: 'student' as 'student' | 'instructor',
    });

    const isInstructor = userRole === 'admin' || course.created_by === course.creator?.id;

    const handleEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/courses/${course.id}/enroll`, {
            onSuccess: () => {
                // Backend will provide flash message, no need for manual toast
                setData({ user_id: '', role: 'student' });
            },
            onError: () => {
                showError('Failed to enroll user. Please try again.');
            },
        });
    };

    const handleUnenroll = (userId: number, userName: string) => {
        confirm({
            title: 'Remove User from Course',
            description: `Are you sure you want to remove ${userName} from this course? They will lose access to all course materials and their progress will be saved but not accessible.`,
            confirmText: 'Yes, Remove User',
            variant: 'destructive',
            onConfirm: () => {
                setUnenrollingUserId(userId);
                router.delete(`/courses/${course.id}/unenroll/${userId}`, {
                    onSuccess: () => {
                        // Backend will provide flash message, no need for manual toast
                    },
                    onError: () => {
                        showError('Failed to remove user from course. Please try again.');
                    },
                    onFinish: () => setUnenrollingUserId(null),
                });
            },
        });
    };

    const filteredUsers =
        course.enrolled_users?.filter(
            (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()),
        ) || [];

    const getRoleBadge = (user: User) => {
        const enrollment = course.enrolled_users?.find((u) => u.id === user.id);
        const role = enrollment?.pivot?.enrolled_as || 'student';

        return role === 'instructor' ? (
            <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">
                Instructor
            </Badge>
        ) : role === 'admin' ? (
            <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                Admin
            </Badge>
        ) : (
            <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                Student
            </Badge>
        );
    };

    if (!isInstructor) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Course Enrollment
                </CardTitle>
                <CardDescription>Manage student and instructor enrollments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Enroll New User */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Enroll New User</h3>
                    <form onSubmit={handleEnroll} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="user_id">User ID</Label>
                                <Input
                                    id="user_id"
                                    type="number"
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    placeholder="Enter user ID"
                                    className={errors.user_id ? 'border-red-500' : ''}
                                />
                                <InputError message={errors.user_id} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value as 'student' | 'instructor')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                        </div>
                        <Button type="submit" disabled={processing}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {processing ? 'Enrolling...' : 'Enroll User'}
                        </Button>
                    </form>
                </div>

                {/* Enrolled Users List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Enrolled Users ({course.enrolled_users?.length || 0})</h3>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 pl-10"
                            />
                        </div>
                    </div>

                    {filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getRoleBadge(user)}
                                        {user.id !== course.created_by && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnenroll(user.id, user.name)}
                                                className="text-destructive hover:text-destructive"
                                                disabled={unenrollingUserId === user.id}
                                            >
                                                {unenrollingUserId === user.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                                ) : (
                                                    <UserMinus className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">{searchTerm ? 'No users found matching your search.' : 'No users enrolled yet.'}</p>
                        </div>
                    )}
                </div>
            </CardContent>
            {confirmDialog}
        </Card>
    );
}
