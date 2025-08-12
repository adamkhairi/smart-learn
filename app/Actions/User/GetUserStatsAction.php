<?php
declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;

class GetUserStatsAction
{
    /**
     * @return array{
     *   total_users: int,
     *   active_users: int,
     *   inactive_users: int,
     *   role_distribution: array{admin:int,instructor:int,student:int},
     *   recent_registrations: \Illuminate\Support\Collection,
     *   top_instructors: \Illuminate\Support\Collection,
     * }
     */
    public function execute(): array
    {
        return [
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'role_distribution' => [
                'admin' => User::role('admin')->count(),
                'instructor' => User::role('instructor')->count(),
                'student' => User::role('student')->count(),
            ],
            'recent_registrations' => User::orderBy('created_at', 'desc')->limit(5)->get(),
            'top_instructors' => User::role('instructor')
                               ->withCount('createdCourses')
                               ->orderBy('created_courses_count', 'desc')
                               ->limit(5)
                               ->get(),
        ];
    }
}
