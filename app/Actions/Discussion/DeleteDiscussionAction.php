<?php

namespace App\Actions\Discussion;

use App\Models\Discussion;

class DeleteDiscussionAction
{
    public function execute(Discussion $discussion): bool
    {
        return $discussion->delete();
    }
}
