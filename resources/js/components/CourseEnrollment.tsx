import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { Course, User } from '@/types';

interface CourseEnrollmentProps {
    course: Course;
    userRole: string;
}

export function CourseEnrollment({ course, userRole }: CourseEnrollmentProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        role: 'student' as 'student' | 'instructor',
    });

    const isInstructor = userRole === 'admin' || course.created_by === course.creator?.id;

    const handleEnroll = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/courses/${course.id}/enroll`);
    };

    const handleUnenroll = (userId: number) => {
        if (confirm('Are you sure you want to remove this user from the course?')) {
            // This would need to be implemented with a proper delete request
            console.log('Unenroll user:', userId);
        }
    };

    const filteredUsers = course.enrolled_users?.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const getRoleBadge = (user: User) => {
        const enrollment = course.enrolled_users?.find(u => u.id === user.id);
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
                <CardDescription>
                    Manage student and instructor enrollments
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Enroll New User */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Enroll New User</h3>
                    <form onSubmit={handleEnroll} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {errors.user_id && (
                                    <p className="text-sm text-red-500">{errors.user_id}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value as 'student' | 'instructor')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-red-500">{errors.role}</p>
                                )}
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>

                    {filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
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
                                                onClick={() => handleUnenroll(user.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? 'No users found matching your search.' : 'No users enrolled yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
