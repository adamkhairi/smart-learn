<?php

namespace App\Actions\Comments;

use App\Models\Comment;
use Illuminate\Support\Facades\DB;

class CreateCommentAction
{
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

            return $comment;
        });
    }
}
