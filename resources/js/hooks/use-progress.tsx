import { useCallback, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface ProgressTrackingOptions {
    courseId: number;
    moduleId?: number;
    itemId?: number;
}

export function useProgressTracking({ courseId, moduleId, itemId }: ProgressTrackingOptions) {
    // Debounced batching for time tracking
    const pendingSecondsRef = useRef<number>(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUnmountedRef = useRef(false);

    useEffect(() => {
        return () => {
            isUnmountedRef.current = true;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);
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

    const flushTime = useCallback(() => {
        const seconds = pendingSecondsRef.current;
        pendingSecondsRef.current = 0;
        if (!seconds || !itemId) return;
        const capped = Math.max(0, Math.min(seconds, 120)); // per-send cap
        router.post(`/courses/${courseId}/progress/update-time`, {
            course_module_id: moduleId,
            course_module_item_id: itemId,
            time_spent_seconds: capped,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // ok
            },
            onError: (errors) => {
                console.error('Failed to update time spent:', errors);
            },
        });
    }, [courseId, moduleId, itemId]);

    const updateTimeSpent = useCallback((seconds: number) => {
        if (!seconds || seconds < 0) return;
        pendingSecondsRef.current += seconds;
        if (timerRef.current) return;
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            if (!isUnmountedRef.current) {
                flushTime();
            }
        }, 15000); // send every 15s
    }, [flushTime]);

    return {
        markAsStarted,
        markAsCompleted,
        updateTimeSpent,
    };
}
