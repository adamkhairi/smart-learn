<?php
declare(strict_types=1);

namespace App\Actions\Dashboard;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class GetStudentDashboardDataAction
{
    /**
     * Build student dashboard data with caching and robust error handling.
     */
    public function execute(User $user): array
    {
        try {
            $userId = (int) $user->id;

            $enrolledCourses = Cache::remember("dashboard.student.{$userId}.enrolled_courses.v1", 60, function () use ($user) {
                return $user->enrollments()
                    ->with(['creator:id,name', 'category:id,name,slug'])
                    ->latest('pivot_created_at')
                    ->limit(5)
                    ->get();
            });

            $latestSubmissions = Cache::remember("dashboard.student.{$userId}.latest_submissions.v1", 60, function () use ($user) {
                return $user->submissions()
                    ->with(['assignment:id,title', 'assessment:id,title', 'course:id,title'])
                    ->orderByDesc('submitted_at')
                    ->limit(5)
                    ->get();
            });

            $overallProgress = Cache::remember("dashboard.student.{$userId}.overall_progress.v1", 60, function () use ($user) {
                $totalCourses = $user->enrollments()->count();
                $completedCourses = $user->progress()->where('status', 'completed')->distinct('course_id')->count();
                $totalCompletedItems = $user->progress()->where('status', 'completed')->count();
                $averageScore = (float) ($user->submissions()->avg('score') ?? 0);

                // This can be heavy; keep it cached.
                $totalItems = 0;
                $user->enrollments()->with('modules.moduleItems:id,module_id')->get()
                    ->each(function ($course) use (&$totalItems) {
                        $course->modules->each(function ($module) use (&$totalItems) {
                            $totalItems += $module->moduleItems->count();
                        });
                    });

                return [
                    'total_courses_enrolled' => $totalCourses,
                    'completed_courses' => $completedCourses,
                    'total_completed_items' => $totalCompletedItems,
                    'total_items_in_enrolled_courses' => $totalItems,
                    'average_score' => $averageScore,
                ];
            });

            // Personal stats may already optimize internally; avoid caching if dynamic.
            $studentStats = method_exists($user, 'getStats') ? $user->getStats() : [];

            return [
                'user' => $user,
                'enrolled_courses' => $enrolledCourses,
                'latest_submissions' => $latestSubmissions,
                'overall_progress' => $overallProgress,
                'personal_stats' => $studentStats,
            ];
        } catch (Throwable $e) {
            Log::error('Failed to build student dashboard data', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);

            return [
                'user' => $user,
                'enrolled_courses' => collect(),
                'latest_submissions' => collect(),
                'overall_progress' => [
                    'total_courses_enrolled' => 0,
                    'completed_courses' => 0,
                    'total_completed_items' => 0,
                    'total_items_in_enrolled_courses' => 0,
                    'average_score' => 0.0,
                ],
                'personal_stats' => [],
            ];
        }
    }
}
