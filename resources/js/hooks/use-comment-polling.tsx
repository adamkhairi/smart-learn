import { useEffect, useRef, useCallback } from 'react';
import { Comment as CommentType } from '@/types';

interface UseCommentPollingOptions {
  discussionId: number;
  onNewComments?: (comments: CommentType[]) => void;
  onError?: (error: Error) => void;
  pollInterval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean; // whether polling is enabled
}

export function useCommentPolling({
  discussionId,
  onNewComments,
  onError,
  pollInterval = 30000, // 30 seconds
  enabled = true,
}: UseCommentPollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCommentIdRef = useRef<number>(0);
  const isPollingRef = useRef(false);

  const fetchComments = useCallback(async () => {
    if (isPollingRef.current) return; // Prevent concurrent requests

    isPollingRef.current = true;

    try {
      const response = await fetch(`/discussions/${discussionId}/comments?after=${lastCommentIdRef.current}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

            if (data.comments && data.comments.length > 0) {
        // Update the last comment ID
        const maxId = Math.max(...data.comments.map((c: CommentType) => c.id));
        lastCommentIdRef.current = Math.max(lastCommentIdRef.current, maxId);

                // Only call callback if there are new comments
        // Filter out comments that might be duplicates
        const uniqueComments = data.comments.filter((comment: CommentType, index: number, self: CommentType[]) =>
          index === self.findIndex((c: CommentType) => c.id === comment.id)
        );
        onNewComments?.(uniqueComments);
      }
    } catch (error) {
      console.error('Error polling comments:', error);
      onError?.(error as Error);
    } finally {
      isPollingRef.current = false;
    }
  }, [discussionId, onNewComments, onError]);

  const startPolling = useCallback(() => {
    if (!enabled || intervalRef.current) return;

    // Initial fetch
    fetchComments();

    // Set up interval
    intervalRef.current = setInterval(fetchComments, pollInterval);
  }, [enabled, pollInterval, fetchComments]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshNow = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  const setLastCommentId = useCallback((commentId: number) => {
    lastCommentIdRef.current = Math.max(lastCommentIdRef.current, commentId);
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    refreshNow,
    setLastCommentId,
    isPolling: isPollingRef.current,
  };
}
