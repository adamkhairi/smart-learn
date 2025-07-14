import { Badge } from '@/components/ui/badge';
import React from 'react';

interface UserStatusBadgeProps {
    isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
    return isActive ? (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Active
        </Badge>
    ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            Inactive
        </Badge>
    );
}
