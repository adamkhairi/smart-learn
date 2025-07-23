<?php

namespace App\Actions\User;

use App\Models\User;

class ToggleUserActiveStatusAction
{
    public function execute(User $user): bool
    {
        return $user->toggleActive();
    }
}
