<?php

namespace App\Actions\Comments;

use App\Models\Comment;
use App\Models\Discussion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class ListNewCommentsAction
{
    public function execute(Request $request, Discussion $discussion): Collection
    {
        $afterId = $request->query('after', 0);

        return Comment::where('commentable_type', Discussion::class)
            ->where('commentable_id', $discussion->id)
            ->where('id', '>', $afterId)
            ->with(['user', 'replies.user', 'likes'])
            ->orderBy('id', 'asc')
            ->get();
    }
} 