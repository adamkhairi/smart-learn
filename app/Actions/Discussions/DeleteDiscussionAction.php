<?php

namespace App\Actions\Discussions;

use App\Models\Discussion;

class DeleteDiscussionAction
{
    /**
     * Delete the given discussion and its related comments.
     *
     * @param Discussion $discussion
     * @return bool|null
     */
    public function execute(Discussion $discussion): ?bool
    {
        // Delete all related comments first (cascade is set in migration, but explicit for clarity)
        $discussion->comments()->delete();

        // Delete the discussion itself
        return $discussion->delete();
    }
}
