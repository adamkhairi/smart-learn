<?php

namespace App\Actions\Comments;

use App\Models\Comment;
use App\Actions\Notification\CreateNotificationAction;
use Illuminate\Support\Facades\DB;

class CreateCommentAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

    /**
     * Create a new comment or reply.
     *
     * @param array $data
     *   - commentable_type: string
     *   - commentable_id: int
     *   - user_id: int
     *   - content: string
     *   - parent_id: int|null
     * @return Comment
     */
    public function execute(array $data): Comment
    {
        return DB::transaction(function () use ($data) {
            $comment = Comment::create([
                'commentable_type' => $data['commentable_type'],
                'commentable_id' => $data['commentable_id'],
                'user_id' => $data['user_id'],
                'content' => $data['content'],
                'parent_id' => $data['parent_id'] ?? null,
            ]);

            // Send notification for discussion replies
            if ($data['commentable_type'] === 'App\\Models\\Discussion') {
                $discussion = \App\Models\Discussion::find($data['commentable_id']);
                $commenter = \App\Models\User::find($data['user_id']);
                
                if ($discussion && $commenter) {
                    // Notify discussion creator if someone else commented
                    if ($discussion->created_by !== $data['user_id']) {
                        $discussionCreator = \App\Models\User::find($discussion->created_by);
                        if ($discussionCreator) {
                            $this->createNotificationAction->createDiscussionReplyNotification(
                                user: $discussionCreator,
                                discussionTitle: $discussion->title,
                                replierName: $commenter->name,
                                actionUrl: "/courses/{$discussion->course_id}/discussions/{$discussion->id}"
                            );
                        }
                    }
                    
                    // If this is a reply to another comment, notify the parent comment author
                    if ($data['parent_id']) {
                        $parentComment = Comment::find($data['parent_id']);
                        if ($parentComment && $parentComment->user_id !== $data['user_id']) {
                            $parentCommentAuthor = \App\Models\User::find($parentComment->user_id);
                            if ($parentCommentAuthor) {
                                $this->createNotificationAction->createDiscussionReplyNotification(
                                    user: $parentCommentAuthor,
                                    discussionTitle: $discussion->title,
                                    replierName: $commenter->name,
                                    actionUrl: "/courses/{$discussion->course_id}/discussions/{$discussion->id}"
                                );
                            }
                        }
                    }
                }
            }

            return $comment;
        });
    }
}
