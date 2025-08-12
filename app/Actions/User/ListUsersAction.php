<?php
declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ListUsersAction
{
    public function execute(Request $request): LengthAwarePaginator
    {
        $query = User::withCount(['enrollments', 'createdCourses', 'submissions']);

        $query->when($request->filled('search'), function ($q) use ($request) {
            $q->search($request->string('search'));
        });

        $query->when($request->filled('role') && $request->input('role') !== 'all', function ($q) use ($request) {
            $q->role((string) $request->input('role'));
        });

        $query->when($request->filled('status') && $request->input('status') !== 'all', function ($q) use ($request) {
            $request->input('status') === 'active'
                ? $q->active()
                : $q->where('is_active', false);
        });

        return $query->orderBy('created_at', 'desc')
                     ->paginate(15)
                     ->withQueryString();
    }
}
