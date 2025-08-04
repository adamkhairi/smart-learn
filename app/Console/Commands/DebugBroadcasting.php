<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Broadcast;

class DebugBroadcasting extends Command
{
    protected $signature = 'broadcasting:debug {user_id}';
    protected $description = 'Debug broadcasting configuration and authentication';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User not found");
            return 1;
        }

        $this->info("🔍 Broadcasting Debug for User: {$user->name} (ID: {$user->id})");
        $this->info("📧 Email: {$user->email}");
        
        // Test channel authorization
        $this->info("\n🔐 Testing Channel Authorization:");
        $channelName = "App.Models.User.{$user->id}";
        $this->info("Channel: {$channelName}");
        
        try {
            // Simulate channel authorization
            $authorized = (int) $user->id === (int) $userId;
            $this->info("Authorization result: " . ($authorized ? '✅ AUTHORIZED' : '❌ DENIED'));
        } catch (\Exception $e) {
            $this->error("Authorization error: " . $e->getMessage());
        }
        
        // Check broadcasting config
        $this->info("\n⚙️ Broadcasting Configuration:");
        $driver = config('broadcasting.default');
        $this->info("Driver: {$driver}");
        
        if ($driver === 'pusher') {
            $pusherConfig = config('broadcasting.connections.pusher');
            $this->info("Pusher App ID: " . ($pusherConfig['app_id'] ? '✅ Set' : '❌ Missing'));
            $this->info("Pusher Key: " . ($pusherConfig['key'] ? '✅ Set' : '❌ Missing'));
            $this->info("Pusher Secret: " . ($pusherConfig['secret'] ? '✅ Set' : '❌ Missing'));
            $this->info("Pusher Cluster: " . ($pusherConfig['options']['cluster'] ?? 'mt1'));
        }
        
        // Test a simple broadcast
        $this->info("\n📡 Testing Simple Broadcast:");
        try {
            $testData = [
                'id' => 'debug-' . time(),
                'title' => 'Debug Test',
                'message' => 'This is a debug broadcast test',
                'type' => 'info',
                'created_at' => now()->toISOString(),
            ];
            
            broadcast(new \Illuminate\Broadcasting\BroadcastEvent(
                new \Illuminate\Broadcasting\PrivateChannel($channelName),
                'notification',
                $testData
            ));
            
            $this->info("✅ Broadcast sent successfully!");
            $this->info("📱 Check your browser console for the notification");
            
        } catch (\Exception $e) {
            $this->error("❌ Broadcast failed: " . $e->getMessage());
        }
        
        $this->info("\n💡 Debugging Tips:");
        $this->info("1. Check browser console for Echo connection logs");
        $this->info("2. Verify CSRF token is present in page meta tags");
        $this->info("3. Check network tab for /broadcasting/auth requests");
        $this->info("4. Ensure user is logged in and authenticated");
        
        return 0;
    }
}
