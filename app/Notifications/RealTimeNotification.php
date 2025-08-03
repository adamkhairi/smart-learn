<?php

namespace App\Notifications;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class RealTimeNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $title;
    public $message;
    public $type;
    public $data;
    public $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $title,
        string $message,
        string $type = 'info',
        ?array $data = null,
        ?string $actionUrl = null
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->data = $data;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'user_id' => $notifiable->id,
            'data' => $this->data,
            'action_url' => $this->actionUrl,
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'user_id' => $notifiable->id, // Add user_id for database storage
            'data' => $this->data,
            'action_url' => $this->actionUrl,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => uniqid('notif_', true), // Generate unique ID for broadcasting
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'data' => $this->data,
            'action_url' => $this->actionUrl,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->notifiable->id),
        ];
    }

    /**
     * Determine if the notification should be broadcast.
     */
    public function shouldBroadcast(): bool
    {
        // Only broadcast if we have valid Pusher credentials
        return config('broadcasting.default') === 'pusher' && 
               config('broadcasting.connections.pusher.key') && 
               config('broadcasting.connections.pusher.secret');
    }

    /**
     * Get the type of the notification being broadcast.
     */
    public function broadcastType(): string
    {
        return 'notification.created';
    }
}
