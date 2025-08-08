<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Pusher\Pusher;

class SimplePusherTest extends Command
{
    protected $signature = 'test:pusher {user_id}';
    protected $description = 'Simple Pusher test with detailed debugging';

    public function handle()
    {
        $userId = $this->argument('user_id');
        
        $this->info("🔧 Testing Pusher configuration...");
        
        // Get config values
        $appId = config('broadcasting.connections.pusher.app_id');
        $key = config('broadcasting.connections.pusher.key');
        $secret = config('broadcasting.connections.pusher.secret');
        $options = config('broadcasting.connections.pusher.options');
        
        $this->info("📋 Configuration:");
        $this->info("   App ID: {$appId}");
        $this->info("   Key: {$key}");
        $this->info("   Secret: " . substr($secret, 0, 8) . "...");
        $this->info("   Host: " . ($options['host'] ?? 'default'));
        $this->info("   Cluster: " . ($options['cluster'] ?? 'default'));
        
        try {
            // Create Pusher instance
            $pusher = new Pusher($key, $secret, $appId, $options);
            
            // Test 1: Simple public channel
            $this->info("🧪 Test 1: Public channel broadcast...");
            $result1 = $pusher->trigger('test-channel', 'test-event', [
                'message' => 'Hello from public channel!',
                'timestamp' => now()->toISOString()
            ]);
            $this->info("   Result: " . json_encode($result1));
            
            // Test 2: Private channel (what we're actually using)
            $this->info("🧪 Test 2: Private channel broadcast...");
            $channelName = "private-App.Models.User.{$userId}";
            $result2 = $pusher->trigger($channelName, 'simple-test', [
                'message' => 'Hello from private channel!',
                'user_id' => $userId,
                'timestamp' => now()->toISOString()
            ]);
            $this->info("   Channel: {$channelName}");
            $this->info("   Result: " . json_encode($result2));
            
            // Test 3: Check channel info
            $this->info("🧪 Test 3: Channel info...");
            try {
                $channelInfo = $pusher->getChannelInfo($channelName);
                $this->info("   Channel info: " . json_encode($channelInfo));
            } catch (\Exception $e) {
                $this->warn("   Channel info failed: " . $e->getMessage());
            }
            
            $this->info("✅ All tests completed!");
            $this->info("🌐 Check your browser console for 'simple-test' events");
            
        } catch (\Exception $e) {
            $this->error("❌ Pusher test failed: " . $e->getMessage());
            $this->error("   Stack trace: " . $e->getTraceAsString());
            return 1;
        }
        
        return 0;
    }
}
