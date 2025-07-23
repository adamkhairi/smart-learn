<?php

namespace App\Actions\Dashboard;

use App\Models\Course;
use App\Models\User;
use App\Models\EnrollmentRequest;

class GetAdminInstructorDashboardDataAction
{
    public function execute(User $user = null): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        $roleDistribution = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $recentRegistrations = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $topInstructors = User::where('role', 'instructor')
            ->withCount('createdCourses')
            ->orderByDesc('created_courses_count')
            ->limit(5)
            ->get();

        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', 'published')->count();
        $draftCourses = Course::where('status', 'draft')->count();
        $archivedCourses = Course::where('status', 'archived')->count();

        $courseLevelDistribution = Course::selectRaw('level, count(*) as count')
            ->groupBy('level')
            ->pluck('count', 'level')
            ->toArray();

        $latestCourses = Course::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $pendingEnrollmentRequestsCount = 0;
        if ($user && $user->isAdmin()) {
            $pendingEnrollmentRequestsCount = EnrollmentRequest::where('status', 'pending')->count();
        }

        return [
            'userStats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'role_distribution' => $roleDistribution,
                'recent_registrations' => $recentRegistrations,
                'top_instructors' => $topInstructors,
            ],
            'courseStats' => [
                'total_courses' => $totalCourses,
                'published_courses' => $publishedCourses,
                'draft_courses' => $draftCourses,
                'archived_courses' => $archivedCourses,
                'level_distribution' => $courseLevelDistribution,
                'latest_courses' => $latestCourses,
            ],
            'pendingEnrollmentRequestsCount' => $pendingEnrollmentRequestsCount,
        ];
    }
}
