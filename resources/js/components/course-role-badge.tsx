import { Badge } from '@/components/ui/badge';
import { Course, User } from '@/types';
import React from 'react';

interface CourseRoleBadgeProps {
    course: Course;
    user: User | null;
}

export function CourseRoleBadge({ course, user }: CourseRoleBadgeProps) {
    if (course.creator?.id === user?.id) {
        return (
            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Creator
            </Badge>
        );
    }

    const enrollment = course.enrolled_users?.find((enrolledUser: User) => enrolledUser.id === user?.id);
    if (enrollment) {
        return (
            <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {enrollment.pivot?.enrolled_as || 'Student'}
            </Badge>
        );
    }

    return null;
}
