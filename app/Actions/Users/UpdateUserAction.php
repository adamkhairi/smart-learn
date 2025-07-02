<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateUserAction
{
    /**
     * Update user with the given data.
     */
    public function execute(User $user, array $userData): User
    {
        $updateData = [
            'name' => $userData['name'],
            'email' => $userData['email'],
            'username' => $userData['username'],
            'role' => $userData['role'],
            'mobile' => $userData['mobile'],
            'is_active' => $userData['is_active'],
        ];

        if (!empty($userData['password'])) {
            $updateData['password'] = Hash::make($userData['password']);
        }

        $user->update($updateData);

        return $user;
    }
}
