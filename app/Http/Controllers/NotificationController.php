<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        $query = $user->notifications()->orderBy('created_at', 'desc');

        // Filter by type if provided
        if ($request->has('type') && $request->type !== 'all') {
            $query->whereJsonContains('data->type', $request->type);
        }

        // Filter by read status if provided
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->whereNull('read_at');
            } elseif ($request->status === 'read') {
                $query->whereNotNull('read_at');
            }
        }

        $notifications = $query->paginate(20);

        // Transform notifications to match frontend expectations
        $notifications->getCollection()->transform(function ($notification) {
            // Laravel automatically casts data to array, but let's be safe
            $data = is_array($notification->data) ? $notification->data : json_decode($notification->data, true) ?? [];
            return [
                'id' => $notification->id,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'type' => $data['type'] ?? 'info',
                'action_url' => $data['action_url'] ?? null,
                'data' => $data['data'] ?? null,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
                'updated_at' => $notification->updated_at,
            ];
        });

        // Get counts for filters
        $counts = [
            'all' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->readNotifications()->count(),
        ];

        // Get type counts
        $typeCounts = [
            'info' => $user->notifications()->whereJsonContains('data->type', 'info')->count(),
            'success' => $user->notifications()->whereJsonContains('data->type', 'success')->count(),
            'warning' => $user->notifications()->whereJsonContains('data->type', 'warning')->count(),
            'error' => $user->notifications()->whereJsonContains('data->type', 'error')->count(),
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
    public function recent()
    {
        $user = Auth::user();
        
        // Use our custom notifications table directly
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => (string) $notification->id, // Convert to string for consistency
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'action_url' => $notification->action_url,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(string $notificationId)
    {
        $user = Auth::user();
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $notificationId)
            ->first();
        
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(string $notificationId)
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $notificationId)->first();
        
        if (!$notification) {
            abort(404, 'Notification not found');
        }

        $notification->update(['read_at' => null]);

        return back()->with([
            'message' => 'Notification marked as unread',
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(string $notificationId)
    {
        $user = Auth::user();
        $notification = $user->notifications()->where('id', $notificationId)->first();
        
        if (!$notification) {
            abort(404, 'Notification not found');
        }

        $notification->delete();

        return back()->with([
            'message' => 'Notification deleted successfully',
        ]);
    }

    /**
     * Delete all read notifications for the authenticated user.
     */
    public function deleteAllRead()
    {
        $user = Auth::user();
        
        $deletedCount = $user->readNotifications()->count();
        $user->readNotifications()->delete();

        return back()->with([
            'message' => "Deleted {$deletedCount} read notifications",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Get notification statistics for the user.
     */
    public function stats()
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

        return back()->with($stats);
    }
}
