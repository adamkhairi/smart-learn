<?php

namespace App\Actions\Discussions;

use App\Models\Discussion;
use Illuminate\Support\Facades\DB;

class CreateDiscussionAction
{
    /**
     * Create a new discussion.
     *
     * @param array $data
     * @return Discussion
     */
    public function execute(array $data): Discussion
    {
        return DB::transaction(function () use ($data) {
            // Only allow required fields
            $discussion = Discussion::create([
                'title' => $data['title'],
                'content' => $data['content'] ?? null,
                'course_id' => $data['course_id'],
                'created_by' => $data['created_by'],
                'is_pinned' => false,
                'is_locked' => false,
                'views_count' => 0,
            ]);

            return $discussion;
        });
    }
}
