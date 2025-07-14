<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;

class CategoryPolicy
{
    public function viewAny(User $user)
    {
        return $user->is_admin;
    }

    public function view(User $user, Category $category)
    {
        return $user->is_admin;
    }

    public function create(User $user)
    {
        return $user->is_admin;
    }

    public function update(User $user, Category $category)
    {
        return $user->is_admin;
    }

    public function delete(User $user, Category $category)
    {
        return $user->is_admin;
    }
}
