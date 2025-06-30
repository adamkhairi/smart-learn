<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@smartlearn.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Instructor User',
            'email' => 'instructor@smartlearn.com',
            'username' => 'instructor',
            'password' => Hash::make('password'),
            'role' => 'instructor',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Student User',
            'email' => 'student@smartlearn.com',
            'username' => 'student',
            'password' => Hash::make('password'),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
