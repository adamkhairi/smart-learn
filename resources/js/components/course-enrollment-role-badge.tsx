import { Badge } from '@/components/ui/badge';

interface CourseEnrollmentRoleBadgeProps {
    role: string;
}

export function CourseEnrollmentRoleBadge({ role }: CourseEnrollmentRoleBadgeProps) {
    const variants = {
        student: 'default',
        instructor: 'secondary',
        admin: 'destructive',
    } as const;

    return <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>;
}
