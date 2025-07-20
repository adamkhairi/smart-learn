<?php

namespace App\Actions\Comments;

use App\Models\Comment;

class DeleteCommentAction
{
    /**
     * Delete a comment and its replies.
     *
     * @param Comment $comment
     * @return void
     */
    public function execute(Comment $comment): void
    {
        // Delete all replies recursively
        $this->deleteReplies($comment);

        // Delete the comment itself
        $comment->delete();
    }

    /**
     * Recursively delete replies to a comment.
     *
     * @param Comment $comment
     * @return void
     */
    protected function deleteReplies(Comment $comment): void
    {
        foreach ($comment->replies as $reply) {
            $this->deleteReplies($reply);
            $reply->delete();
        }
    }
}
