<?php

namespace App\Actions\Dashboard;

use App\Models\User;

class GetStudentDashboardDataAction
{
    public function execute(User $user): array
    {
        $enrolledCourses = $user->enrollments()
                               ->with(['creator', 'category'])
                               ->limit(5)
                               ->get();

        $latestSubmissions = $user->submissions()
                                 ->with(['assignment', 'assessment', 'course'])
                                 ->orderByDesc('submitted_at')
                                 ->limit(5)
                                 ->get();

        $overallProgress = [
            'total_courses_enrolled' => $user->enrollments()->count(),
            'completed_courses' => $user->progress()->where('status', 'completed')->distinct('course_id')->count(),
            'total_completed_items' => $user->progress()->where('status', 'completed')->count(),
            'total_items_in_enrolled_courses' => 0,
            'average_score' => $user->submissions()->avg('score') ?? 0,
        ];

        $totalItems = 0;
        foreach ($user->enrollments()->with('modules.moduleItems')->get() as $course) {
            foreach ($course->modules as $module) {
                $totalItems += $module->moduleItems->count();
            }
        }
        $overallProgress['total_items_in_enrolled_courses'] = $totalItems;

        $studentStats = $user->getStats();

        return [
            'user' => $user,
            'enrolled_courses' => $enrolledCourses,
            'latest_submissions' => $latestSubmissions,
            'overall_progress' => $overallProgress,
            'personal_stats' => $studentStats,
        ];
    }
}
