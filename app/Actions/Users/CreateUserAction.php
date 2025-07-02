<?php

namespace App\Actions\Users;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    /**
     * Create a new user with the given data.
     */
    public function execute(array $userData): User
    {
        return User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'username' => $userData['username'],
            'password' => Hash::make($userData['password']),
            'role' => $userData['role'],
            'mobile' => $userData['mobile'],
            'is_active' => $userData['is_active'],
        ]);
    }
}
