import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';

interface UseDragDropOptions {
    onReorder?: (draggedId: number, targetId: number) => void;
    reorderUrl?: string;
    preserveState?: boolean;
    preserveScroll?: boolean;
}

export function useDragDrop<T extends { id: number }>({
    onReorder,
    reorderUrl,
    preserveState = true,
    preserveScroll = true,
}: UseDragDropOptions = {}) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, itemId: number) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetItemId: number, items: T[]) => {
            e.preventDefault();

            if (!draggedItem || draggedItem === targetItemId) {
                setDraggedItem(null);
                return;
            }

            const draggedIndex = items.findIndex((item) => item.id === draggedItem);
            const targetIndex = items.findIndex((item) => item.id === targetItemId);

            if (draggedIndex === -1 || targetIndex === -1) {
                setDraggedItem(null);
                return;
            }

            // Call custom reorder function if provided
            if (onReorder) {
                onReorder(draggedItem, targetItemId);
                setDraggedItem(null);
                return;
            }

            // Use API call if URL is provided
            if (reorderUrl) {
                router.patch(
                    reorderUrl,
                    {
                        target_position: targetIndex + 1,
                    },
                    {
                        preserveState,
                        preserveScroll,
                        onSuccess: () => {
                            setDraggedItem(null);
                        },
                        onError: (errors) => {
                            console.error('Failed to reorder items:', errors);
                            setDraggedItem(null);
                        },
                    },
                );
            }
        },
        [draggedItem, onReorder, reorderUrl, preserveState, preserveScroll],
    );

    return {
        draggedItem,
        handleDragStart,
        handleDragOver,
        handleDrop,
    };
}
