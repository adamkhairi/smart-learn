<?php

namespace App\Actions\Comments;

use App\Models\Comment;

class UpdateCommentAction
{
    /**
     * Update the given comment with new data.
     *
     * @param Comment $comment
     * @param array $data
     * @return Comment
     */
    public function execute(Comment $comment, array $data): Comment
    {
        $comment->update([
            'content' => $data['content'],
        ]);

        return $comment;
    }
}
