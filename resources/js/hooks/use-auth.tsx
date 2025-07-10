import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;

    const isAuthenticated = !!auth?.user;
    const user = auth?.user;

    const isAdmin = user?.role === 'admin';
    const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
    const isStudent = user?.role === 'student';

    const canManageCourse = (courseCreatedBy?: number) => {
        if (!user) return false;
        return isAdmin || user.id === courseCreatedBy;
    };

    const canAccessCourse = (userEnrollment?: { enrolled_as: string } | null) => {
        if (!user) return false;
        return isAdmin || !!userEnrollment;
    };

    return {
        user,
        isAuthenticated,
        isAdmin,
        isInstructor,
        isStudent,
        canManageCourse,
        canAccessCourse,
    };
}
