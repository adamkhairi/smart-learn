<?php
declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class ToggleUserActiveStatusAction
{
    public function execute(User $user): bool
    {
        try {
            return (bool) $user->toggleActive();
        } catch (\Throwable $e) {
            Log::error('Failed to toggle user active status', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
