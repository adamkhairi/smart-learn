<?php

namespace App\Events\Discussions;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Comment $comment;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\Comment $comment
     */
    public function __construct(Comment $comment)
    {
        // Eager load relationships for frontend convenience
        $this->comment = $comment->load('user', 'likes');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Broadcast to a private channel for the specific discussion (commentable entity).
        return new PrivateChannel('discussion.' . $this->comment->commentable_id);
    }

    /**
     * The data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'comment' => [
                'id' => $this->comment->id,
                'content' => $this->comment->content,
                'user_id' => $this->comment->user_id,
                'commentable_id' => $this->comment->commentable_id,
                'commentable_type' => $this->comment->commentable_type,
                'parent_id' => $this->comment->parent_id,
                'created_at' => $this->comment->created_at->toIso8601String(),
                'updated_at' => $this->comment->updated_at->toIso8601String(),
                'user' => [
                    'id' => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'photo' => $this->comment->user->photo,
                ],
                'likes_count' => $this->comment->likes->count(),
                // A new comment will not have replies when created.
                // The frontend should expect an empty array.
                'replies' => [],
            ],
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'CommentCreated';
    }
}
