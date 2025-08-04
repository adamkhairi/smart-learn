<?php

namespace App\Console\Commands;

use App\Actions\Notification\CreateNotificationAction;
use App\Models\User;
use Illuminate\Console\Command;

class TestLocalNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:test-local {user_id : The ID of the user to send test notification to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test notification without broadcasting (database only)';

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

        $this->info("Sending test database notification to {$user->name} ({$user->email})...");

        try {
            // Send a database-only notification (no broadcasting)
            $notification = $this->createNotificationAction->execute(
                user: $user,
                title: 'Test Database Notification',
                message: 'This is a test notification stored in the database only.',
                type: 'info',
                data: [
                    'test' => true,
                    'timestamp' => now()->toISOString(),
                ],
                actionUrl: '/dashboard'
            );

            $this->info('✅ Database notification created successfully!');
            $this->info("Notification ID: {$notification->id}");
            $this->info('Check your notification bell - you should see the new notification.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to create notification: {$e->getMessage()}");
            return 1;
        }
    }
}
