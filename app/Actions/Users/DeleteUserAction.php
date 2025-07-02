<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteUserAction
{
    /**
     * Safely delete a user and cleanup related data.
     */
    public function execute(User $user): void
    {
        DB::transaction(function () use ($user) {
            // Remove all course enrollments
            $user->enrollments()->detach();

            // Soft delete the user
            $user->delete();
        });
    }
}
