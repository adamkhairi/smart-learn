<?php

namespace App\Actions\Discussion;

use App\Models\Discussion;

class ShowDiscussionAction
{
    public function execute(Discussion $discussion): Discussion
    {
        return $discussion->load(['user', 'comments.user', 'comments.replies' => function ($query) {
            $query->with('user', 'likes')->orderBy('created_at', 'asc');
        }, 'comments.likes']);
    }
}
