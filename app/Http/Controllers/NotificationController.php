<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc');

        // Filter by type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->byType($request->type);
        }

        // Filter by read status if provided
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        $notifications = $query->paginate(20);

        // Get counts for filters
        $counts = [
            'all' => Notification::forUser($user->id)->count(),
            'unread' => Notification::forUser($user->id)->unread()->count(),
            'read' => Notification::forUser($user->id)->read()->count(),
        ];

        // Get type counts
        $typeCounts = [
            'info' => Notification::forUser($user->id)->byType('info')->count(),
            'success' => Notification::forUser($user->id)->byType('success')->count(),
            'warning' => Notification::forUser($user->id)->byType('warning')->count(),
            'error' => Notification::forUser($user->id)->byType('error')->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'counts' => $counts,
            'typeCounts' => $typeCounts,
            'filters' => [
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
            ],
        ]);
    }

    /**
     * Get recent notifications for dropdown/bell icon.
     */
    public function recent(): JsonResponse
    {
        $user = Auth::user();
        
        $notifications = Notification::forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = Notification::forUser($user->id)->unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        // Ensure user can only mark their own notifications
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(Notification $notification): JsonResponse
    {
        // Ensure user can only mark their own notifications
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->markAsUnread();

        return response()->json([
            'message' => 'Notification marked as unread',
            'notification' => $notification->fresh(),
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        
        Notification::forUser($user->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification): JsonResponse
    {
        // Ensure user can only delete their own notifications
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully',
        ]);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteAllRead(): JsonResponse
    {
        $user = Auth::user();
        
        $deletedCount = Notification::forUser($user->id)
            ->read()
            ->delete();

        return response()->json([
            'message' => "Deleted {$deletedCount} read notifications",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Get notification statistics for the user.
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        
        $stats = [
            'total' => Notification::forUser($user->id)->count(),
            'unread' => Notification::forUser($user->id)->unread()->count(),
            'read' => Notification::forUser($user->id)->read()->count(),
            'recent' => Notification::forUser($user->id)->recent(7)->count(),
            'by_type' => [
                'info' => Notification::forUser($user->id)->byType('info')->count(),
                'success' => Notification::forUser($user->id)->byType('success')->count(),
                'warning' => Notification::forUser($user->id)->byType('warning')->count(),
                'error' => Notification::forUser($user->id)->byType('error')->count(),
            ],
        ];

        return response()->json($stats);
    }
}
