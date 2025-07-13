import { useCallback } from 'react';

interface ProgressTrackingOptions {
    courseId: number;
    moduleId?: number;
    itemId?: number;
}

export function useProgressTracking({ courseId, moduleId, itemId }: ProgressTrackingOptions) {
    const markAsStarted = useCallback(async () => {
        console.log('Marking as started:', { courseId, moduleId, itemId });

        try {
            const response = await fetch(`/courses/${courseId}/progress/mark-started`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_module_id: moduleId,
                    course_module_item_id: itemId,
                }),
            });

            if (response.ok) {
                console.log('Successfully marked as started');
            } else {
                console.error('Failed to mark as started:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to mark as started:', error);
        }
    }, [courseId, moduleId, itemId]);

    const markAsCompleted = useCallback(async () => {
        console.log('Marking as completed:', { courseId, moduleId, itemId });

        try {
            const response = await fetch(`/courses/${courseId}/progress/mark-completed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_module_id: moduleId,
                    course_module_item_id: itemId,
                }),
            });

            if (response.ok) {
                console.log('Successfully marked as completed');
            } else {
                console.error('Failed to mark as completed:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to mark as completed:', error);
        }
    }, [courseId, moduleId, itemId]);

    const updateTimeSpent = useCallback(async (seconds: number) => {
        console.log('Updating time spent:', { courseId, moduleId, itemId, seconds });

        try {
            const response = await fetch(`/courses/${courseId}/progress/update-time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    course_module_id: moduleId,
                    course_module_item_id: itemId,
                    time_spent_seconds: seconds,
                }),
            });

            if (response.ok) {
                console.log('Successfully updated time spent');
            } else {
                console.error('Failed to update time spent:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to update time spent:', error);
        }
    }, [courseId, moduleId, itemId]);

    return {
        markAsStarted,
        markAsCompleted,
        updateTimeSpent,
    };
}
