<?php

namespace App\Console\Commands;

use App\Actions\Notification\CreateNotificationAction;
use App\Models\User;
use Illuminate\Console\Command;

class TestNotificationCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'test:notification 
                            {user_id : The ID of the user to send notification to}
                            {--type=info : Notification type (info, success, warning, error)}
                            {--broadcast : Send with real-time broadcasting}';

    /**
     * The console command description.
     */
    protected $description = 'Test notification system by sending a test notification to a user';

    /**
     * Execute the console command.
     */
    public function handle(CreateNotificationAction $createNotificationAction): int
    {
        $userId = $this->argument('user_id');
        $type = $this->option('type');
        $broadcast = $this->option('broadcast');

        // Find the user
        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        // Create test notification data
        $title = 'Test Notification';
        $message = 'This is a test notification sent at ' . now()->format('Y-m-d H:i:s');
        $actionUrl = '/dashboard'; // Simple action URL for testing
        $data = [
            'test' => true,
            'timestamp' => now()->toISOString(),
            'command_type' => $broadcast ? 'broadcast' : 'database-only'
        ];

        $this->info("Sending {$type} notification to {$user->name} (ID: {$userId})...");

        try {
            if ($broadcast) {
                $this->info('Using real-time broadcasting...');
                $result = $createNotificationAction->executeWithBroadcast(
                    user: $user,
                    title: $title,
                    message: $message,
                    type: $type,
                    data: $data,
                    actionUrl: $actionUrl
                );
            } else {
                $this->info('Using database-only...');
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
                $this->info('✅ Notification sent successfully!');
                $this->info("Type: {$type}");
                $this->info("Title: {$title}");
                $this->info("Message: {$message}");
                $this->info("Broadcast: " . ($broadcast ? 'Yes' : 'No'));
                
                if ($broadcast) {
                    $this->info("📡 Check your browser for real-time notification!");
                    $this->info("🔔 You should see a toast notification appear immediately.");
                }
            } else {
                $this->error('❌ Failed to send notification.');
            }
        } catch (\Exception $e) {
            $this->error('❌ Error sending notification: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
