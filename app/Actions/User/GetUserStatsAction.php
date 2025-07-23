<?php

namespace App\Actions\User;

use App\Models\User;

class GetUserStatsAction
{
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
