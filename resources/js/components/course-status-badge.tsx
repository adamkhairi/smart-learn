import { Badge } from '@/components/ui/badge';
import React from 'react';

interface StatusBadgeProps {
    status: string;
}

export function CourseStatusBadge({ status }: StatusBadgeProps) {
    if (status === 'published') {
        return (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Published
            </Badge>
        );
    } else if (status === 'draft') {
        return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Draft
            </Badge>
        );
    } else if (status === 'archived') {
        return (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                Archived
            </Badge>
        );
    } else {
        return null; // Or a default badge for unknown status
    }
}
