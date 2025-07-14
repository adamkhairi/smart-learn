import { Badge } from '@/components/ui/badge';
import React from 'react';

interface UserRoleBadgeProps {
    role: string;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
    const config = {
        admin: { variant: 'destructive' as const, label: 'Admin' },
        instructor: { variant: 'default' as const, label: 'Instructor' },
        student: { variant: 'secondary' as const, label: 'Student' },
    };
    const { variant, label } = config[role as keyof typeof config] || config.student;
    return <Badge variant={variant}>{label}</Badge>;
}
