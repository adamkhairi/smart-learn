<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class ManageCourseEnrollmentsAction
{
    public function execute(Request $request, Course $course): array
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'role_filter' => 'nullable|string|max:255',
            'enrolled_page' => 'nullable|integer|min:1',
            'available_page' => 'nullable|integer|min:1',
        ]);

        $search = $validated['search'] ?? '';
        $roleFilter = $validated['role_filter'] ?? 'all'; // For enrolled users
        $enrolledPage = $validated['enrolled_page'] ?? 1;
        $availablePage = $validated['available_page'] ?? 1;

        // Enrolled Users Query
        $enrolledUsersQuery = $course->enrolledUsers();

        if (!empty($search)) {
            $enrolledUsersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter !== 'all') {
            $enrolledUsersQuery->wherePivot('enrolled_as', $roleFilter);
        }

        $enrolledUsers = $enrolledUsersQuery->paginate(10, ['*'], 'enrolled_page', $enrolledPage); // Paginate enrolled users

        // Available Users Query
        $availableUsersQuery = User::query();

        // Exclude already enrolled users
        $enrolledUserIds = $course->enrolledUsers()->pluck('users.id');
        $availableUsersQuery->whereNotIn('id', $enrolledUserIds);

        if (!empty($search)) {
            $availableUsersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $availableUsers = $availableUsersQuery->paginate(10, ['*'], 'available_page', $availablePage); // Paginate available users

        return [
            'course' => $course,
            'enrolledUsers' => $enrolledUsers,
            'availableUsers' => $availableUsers,
            'filters' => [
                'search' => $search,
                'role_filter' => $roleFilter,
            ],
        ];
    }
}
