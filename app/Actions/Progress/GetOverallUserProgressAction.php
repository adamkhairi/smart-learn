<?php

namespace App\Actions\Progress;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\UserProgress;
use App\Models\CourseModuleItem;

class GetOverallUserProgressAction
{
    public function execute(): array
    {
        $user = Auth::user();
        // Do not eager-load module items; we'll aggregate with queries
        $enrolledCourses = $user->enrollments()->with(['modules'])->get();
        $overallProgress = [];

        foreach ($enrolledCourses as $course) {
            // Total items via module -> items count
            $moduleIds = $course->modules()->pluck('id');
            $totalItems = CourseModuleItem::whereIn('course_module_id', $moduleIds)->count();

            // Status counts and total time in a single pass
            $statusCounts = UserProgress::select('status', DB::raw('COUNT(*) as cnt'))
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->groupBy('status')
                ->pluck('cnt', 'status');

            $completed = (int) ($statusCounts['completed'] ?? 0);
            $inProgress = (int) ($statusCounts['in_progress'] ?? 0);
            $notStarted = max(0, $totalItems - $completed - $inProgress);

            $totalTimeSpent = (int) UserProgress::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->sum('time_spent_seconds');

            $progress = [
                'total_items' => $totalItems,
                'completed_items' => $completed,
                'in_progress_items' => $inProgress,
                'not_started_items' => $notStarted,
                'completion_percentage' => $totalItems > 0 ? round(($completed / $totalItems) * 100, 2) : 0,
                'total_time_spent' => $totalTimeSpent,
            ];
            $overallProgress[] = [
                'course' => $course,
                'progress' => $progress,
            ];
        }

        return [
            'courses' => $enrolledCourses,
            'overallProgress' => $overallProgress,
        ];
    }
}
