<?php
declare(strict_types=1);

namespace App\Actions\Dashboard;

use App\Models\Course;
use App\Models\User;
use App\Models\EnrollmentRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class GetAdminInstructorDashboardDataAction
{
    /**
     * Build admin/instructor dashboard data with lightweight caching and robust error handling.
     */
    public function execute(?User $user = null): array
    {
        $cacheKey = 'dashboard.admin_instructor.v1';

        try {
            // Cache the expensive, mostly-static aggregates for 60 seconds.
            $payload = Cache::remember($cacheKey, 60, function (): array {
                $totalUsers = User::count();
                $activeUsers = User::where('is_active', true)->count();
                $inactiveUsers = $totalUsers - $activeUsers;

                $roleDistribution = User::selectRaw('role, count(*) as count')
                    ->groupBy('role')
                    ->pluck('count', 'role')
                    ->toArray();

                $recentRegistrations = User::orderByDesc('created_at')
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

                $latestCourses = Course::orderByDesc('created_at')
                    ->limit(5)
                    ->get();

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
                ];
            });

            // Include dynamic counts that should not be cached with global aggregates.
            $payload['pendingEnrollmentRequestsCount'] = ($user && method_exists($user, 'isAdmin') && $user->isAdmin())
                ? EnrollmentRequest::where('status', 'pending')->count()
                : 0;

            return $payload;
        } catch (Throwable $e) {
            Log::error('Failed to build admin/instructor dashboard data', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
            ]);

            return [
                'userStats' => [
                    'total_users' => 0,
                    'active_users' => 0,
                    'inactive_users' => 0,
                    'role_distribution' => [],
                    'recent_registrations' => collect(),
                    'top_instructors' => collect(),
                ],
                'courseStats' => [
                    'total_courses' => 0,
                    'published_courses' => 0,
                    'draft_courses' => 0,
                    'archived_courses' => 0,
                    'level_distribution' => [],
                    'latest_courses' => collect(),
                ],
                'pendingEnrollmentRequestsCount' => 0,
            ];
        }
    }
}
