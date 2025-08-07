<?php

namespace App\Console\Commands;

use App\Events\TestBroadcastEvent;
use Illuminate\Console\Command;

class TestBroadcastCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'test:broadcast {userId} {message?}';

    /**
     * The console command description.
     */
    protected $description = 'Test broadcasting functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('userId');
        $message = $this->argument('message') ?? 'Test broadcast message';

        $this->info("Broadcasting test event to user {$userId}...");

        // Broadcast the test event
        broadcast(new TestBroadcastEvent($message, $userId));

        $this->info("✅ Test broadcast event sent successfully!");
        $this->info("📡 Check your browser console for the event.");

        return 0;
    }
}
