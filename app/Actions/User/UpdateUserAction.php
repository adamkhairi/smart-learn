<?php

namespace App\Actions\User;

use App\Models\User;
use Exception;

class UpdateUserAction
{
    public function execute(User $user, array $data): bool
    {
        // Only update password if it's provided and not empty
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']); // Remove password from data if not provided
        }

        try {
            return $user->update($data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to update user. Please try again.');
        }
    }
}
