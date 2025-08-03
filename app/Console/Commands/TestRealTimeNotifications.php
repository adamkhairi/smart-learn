<?php

namespace App\Console\Commands;

use App\Actions\Notification\CreateNotificationAction;
use App\Models\User;
use Illuminate\Console\Command;

class TestRealTimeNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:test-realtime {user_id : The ID of the user to send test notification to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test real-time notification to verify the system is working';

    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $userId = $this->argument('user_id');
        
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $this->info("Sending test real-time notification to {$user->name} ({$user->email})...");

        try {
            // Send a test real-time notification
            $notification = $this->createNotificationAction->executeWithBroadcast(
                user: $user,
                title: 'Test Real-time Notification',
                message: 'This is a test notification to verify that real-time notifications are working correctly!',
                type: 'info',
                data: [
                    'test' => true,
                    'timestamp' => now()->toISOString(),
                ],
                actionUrl: '/dashboard'
            );

            $this->info('✅ Test notification sent successfully!');
            $this->info("Notification ID: {$notification->id}");
            $this->info('📧 Database notification created');
            $this->info('📡 Broadcasting attempted (check logs for any errors)');
            $this->info('🌐 Check your browser - you should see a toast notification appear.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to send test notification: {$e->getMessage()}");
            return 1;
        }
    }
}
