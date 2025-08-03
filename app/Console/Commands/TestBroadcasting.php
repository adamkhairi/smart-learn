<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Broadcast;
use Pusher\Pusher;

class TestBroadcasting extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'broadcasting:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test broadcasting configuration and Pusher connection';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Testing Broadcasting Configuration...');
        
        // Check environment variables
        $this->info('📋 Checking Environment Variables:');
        $broadcastDriver = config('broadcasting.default');
        $this->line("BROADCAST_DRIVER: {$broadcastDriver}");
        
        if ($broadcastDriver !== 'pusher') {
            $this->error('❌ BROADCAST_DRIVER is not set to "pusher"');
            $this->info('💡 Set BROADCAST_DRIVER=pusher in your .env file');
            return 1;
        }
        
        $pusherConfig = config('broadcasting.connections.pusher');
        $this->line("PUSHER_APP_KEY: " . ($pusherConfig['key'] ? '✅ Set' : '❌ Missing'));
        $this->line("PUSHER_APP_SECRET: " . ($pusherConfig['secret'] ? '✅ Set' : '❌ Missing'));
        $this->line("PUSHER_APP_ID: " . ($pusherConfig['app_id'] ? '✅ Set' : '❌ Missing'));
        $this->line("PUSHER_APP_CLUSTER: " . ($pusherConfig['options']['cluster'] ?? 'us2'));
        
        if (!$pusherConfig['key'] || !$pusherConfig['secret'] || !$pusherConfig['app_id']) {
            $this->error('❌ Missing Pusher credentials in .env file');
            $this->info('💡 Add the following to your .env file:');
            $this->info('PUSHER_APP_ID=your_app_id');
            $this->info('PUSHER_APP_KEY=your_app_key');
            $this->info('PUSHER_APP_SECRET=your_app_secret');
            $this->info('PUSHER_APP_CLUSTER=us2');
            return 1;
        }
        
        // Test Pusher connection
        $this->info('🔗 Testing Pusher Connection...');
        try {
            $pusher = new Pusher(
                $pusherConfig['key'],
                $pusherConfig['secret'],
                $pusherConfig['app_id'],
                $pusherConfig['options']
            );
            
            // Test a simple trigger
            $result = $pusher->trigger('test-channel', 'test-event', ['message' => 'test']);
            
            if ($result) {
                $this->info('✅ Pusher connection successful!');
                $this->info('🎉 Broadcasting configuration is working correctly');
                return 0;
            } else {
                $this->error('❌ Pusher connection failed');
                return 1;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Pusher connection error: ' . $e->getMessage());
            $this->info('💡 Check your Pusher credentials and network connection');
            return 1;
        }
    }
}
