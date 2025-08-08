<?php

namespace App\Http\Controllers;

use App\Actions\Notification\CreateNotificationAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestNotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Send a test notification to the current user
     */
    public function sendTest(Request $request, CreateNotificationAction $createNotificationAction)
    {
        $request->validate([
            'type' => 'required|in:info,success,warning,error',
            'broadcast' => 'boolean',
        ]);

        $user = Auth::user();
        $type = $request->input('type', 'info');
        $broadcast = $request->boolean('broadcast', false);

        $title = 'Test Notification';
        $message = "This is a test {$type} notification sent at " . now()->format('Y-m-d H:i:s');
        $actionUrl = '/dashboard';
        $data = [
            'test' => true,
            'timestamp' => now()->toISOString(),
            'method' => $broadcast ? 'broadcast' : 'database-only'
        ];

        try {
            if ($broadcast) {
                $result = $createNotificationAction->executeWithBroadcast(
                    user: $user,
                    title: $title,
                    message: $message,
                    type: $type,
                    data: $data,
                    actionUrl: $actionUrl
                );
            } else {
                $result = $createNotificationAction->execute(
                    user: $user,
                    title: $title,
                    message: $message,
                    type: $type,
                    data: $data,
                    actionUrl: $actionUrl
                );
            }

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Test notification sent successfully!',
                    'details' => [
                        'type' => $type,
                        'broadcast' => $broadcast,
                        'title' => $title,
                        'notification_message' => $message,
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send notification'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show test notification page
     */
    public function showTestPage()
    {
        return inertia('TestNotifications');
    }
}
