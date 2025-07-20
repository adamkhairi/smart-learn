<?php

namespace App\Actions\Discussions;

use App\Models\Discussion;

class UpdateDiscussionAction
{
    /**
     * Update the given discussion with validated data.
     *
     * @param  \App\Models\Discussion  $discussion
     * @param  array  $data
     * @return \App\Models\Discussion
     */
    public function execute(Discussion $discussion, array $data): Discussion
    {
        $discussion->update([
            'title' => $data['title'],
            'body' => $data['body'] ?? $discussion->body,
            'status' => $data['status'] ?? $discussion->status,
        ]);

        return $discussion;
    }
}
