<?php

namespace App\Console\Commands;

use App\Actions\Notification\CreateNotificationAction;
use App\Models\User;
use Illuminate\Console\Command;

class SimpleNotificationTest extends Command
{
    protected $signature = 'test:notification {user_id}';
    protected $description = 'Simple notification test';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User not found");
            return 1;
        }

        $this->info("🚀 Sending real-time UI notification to {$user->name} ({$user->email})...");
        $this->info("📡 Broadcasting to channel: App.Models.User.{$user->id}");

        $action = new CreateNotificationAction();
        
        try {
            // Send a comprehensive real-time notification
            $notification = $action->executeWithBroadcast(
                user: $user,
                title: '🎉 Real-Time Test Notification',
                message: 'This is a test of the real-time notification system! If you can see this as a toast notification in your browser, the system is working perfectly.',
                type: 'success',
                data: [
                    'test' => true,
                    'timestamp' => now()->toISOString(),
                    'source' => 'artisan_command',
                    'broadcast_channel' => "App.Models.User.{$user->id}"
                ],
                actionUrl: '/dashboard'
            );
            
            $this->info("✅ Real-time notification sent successfully!");
            $this->info("📧 Database notification ID: {$notification->id}");
            $this->info("📡 Broadcasting attempted to private channel");
            $this->info("🌐 Check your browser now - you should see:");
            $this->info("   • A toast notification appear");
            $this->info("   • The notification bell counter update");
            $this->info("   • The notification in the dropdown");
            
            // Additional debugging info
            $broadcastConfig = config('broadcasting.default');
            $pusherKey = config('broadcasting.connections.pusher.key');
            
            $this->info("\n🔧 Broadcasting Configuration:");
            $this->info("   • Driver: {$broadcastConfig}");
            $this->info("   • Pusher Key: " . ($pusherKey ? '✅ Configured' : '❌ Missing'));
            
            if (!$pusherKey) {
                $this->warn("⚠️  Pusher credentials not configured - only database notification created");
                $this->info("💡 Add Pusher credentials to .env to enable real-time broadcasting");
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            $this->error("📋 Stack trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}
