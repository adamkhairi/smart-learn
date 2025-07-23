<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ListUsersAction
{
    public function execute(Request $request): LengthAwarePaginator
    {
        $query = User::withCount(['enrollments', 'createdCourses', 'submissions']);

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->role($request->role);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        return $query->orderBy('created_at', 'desc')
                     ->paginate(15)
                     ->withQueryString();
    }
}
