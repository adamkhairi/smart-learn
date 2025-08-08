import { useCallback } from 'react';
import { router } from '@inertiajs/react';

interface ProgressTrackingOptions {
    courseId: number;
    moduleId?: number;
    itemId?: number;
}

export function useProgressTracking({ courseId, moduleId, itemId }: ProgressTrackingOptions) {
    const markAsStarted = useCallback(() => {
        console.log('Marking as started:', { courseId, moduleId, itemId });

        router.post(`/courses/${courseId}/progress/mark-started`, {
            course_module_id: moduleId,
            course_module_item_id: itemId,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                console.log('Successfully marked as started');
            },
            onError: (errors) => {
                console.error('Failed to mark as started:', errors);
            },
        });
    }, [courseId, moduleId, itemId]);

    const markAsCompleted = useCallback(() => {
        console.log('Marking as completed:', { courseId, moduleId, itemId });

        router.post(`/courses/${courseId}/progress/mark-completed`, {
            course_module_id: moduleId,
            course_module_item_id: itemId,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                console.log('Successfully marked as completed');
            },
            onError: (errors) => {
                console.error('Failed to mark as completed:', errors);
            },
        });
    }, [courseId, moduleId, itemId]);

    const updateTimeSpent = useCallback((seconds: number) => {
        console.log('Updating time spent:', { courseId, moduleId, itemId, seconds });

        router.post(`/courses/${courseId}/progress/update-time`, {
            course_module_id: moduleId,
            course_module_item_id: itemId,
            time_spent_seconds: seconds,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                console.log('Successfully updated time spent');
            },
            onError: (errors) => {
                console.error('Failed to update time spent:', errors);
            },
        });
    }, [courseId, moduleId, itemId]);

    return {
        markAsStarted,
        markAsCompleted,
        updateTimeSpent,
    };
}
