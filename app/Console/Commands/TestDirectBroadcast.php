<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Broadcast;
use Pusher\Pusher;

class TestDirectBroadcast extends Command
{
    protected $signature = 'test:broadcast {user_id}';
    protected $description = 'Test direct broadcasting without Laravel notifications';

    public function handle()
    {
        $userId = $this->argument('user_id');
        
        $this->info("🚀 Testing direct broadcast to user {$userId}...");
        
        try {
            // Method 1: Direct Pusher API
            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                config('broadcasting.connections.pusher.options')
            );
            
            $channelName = "private-App.Models.User.{$userId}";
            $eventName = 'notification';
            $data = [
                'title' => 'Direct Broadcast Test',
                'message' => 'This is a direct Pusher API test',
                'type' => 'info',
                'created_at' => now()->toISOString()
            ];
            
            $result = $pusher->trigger($channelName, $eventName, $data);
            
            $this->info("📡 Direct Pusher API result: " . json_encode($result));
            
            // Method 2: Laravel Broadcasting
            $this->info("🔄 Testing Laravel broadcasting...");
            
            broadcast(new \Illuminate\Broadcasting\BroadcastEvent(
                new \Illuminate\Broadcasting\PrivateChannel("App.Models.User.{$userId}"),
                'test-event',
                [
                    'title' => 'Laravel Broadcast Test',
                    'message' => 'This is a Laravel broadcast test',
                    'type' => 'warning'
                ]
            ));
            
            $this->info("✅ Both broadcast methods executed!");
            $this->info("🌐 Check your browser console for events");
            
        } catch (\Exception $e) {
            $this->error("❌ Broadcast failed: " . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
