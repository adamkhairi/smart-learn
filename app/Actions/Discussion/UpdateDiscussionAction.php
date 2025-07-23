<?php

namespace App\Actions\Discussion;

use App\Models\Discussion;

class UpdateDiscussionAction
{
    public function execute(Discussion $discussion, array $data): bool
    {
        return $discussion->update($data);
    }
}
