<?php

namespace App\Events\Discussions;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The ID of the comment that was deleted.
     *
     * @var int
     */
    public int $commentId;

    /**
     * The ID of the commentable entity (e.g., Discussion).
     *
     * @var int
     */
    public int $commentableId;

    /**
     * Create a new event instance.
     *
     * @param int $commentId
     * @param int $commentableId
     */
    public function __construct(int $commentId, int $commentableId)
    {
        $this->commentId = $commentId;
        $this->commentableId = $commentableId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Broadcast to a private channel for the specific discussion (commentable entity).
        return new PrivateChannel('discussion.' . $this->commentableId);
    }

    /**
     * The data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'commentId' => $this->commentId,
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'CommentDeleted';
    }
}
