<?php
declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class DeleteUserAction
{
    public function execute(User $user): bool
    {
        try {
            return (bool) $user->delete();
        } catch (\Throwable $e) {
            Log::error('Failed to delete user', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
