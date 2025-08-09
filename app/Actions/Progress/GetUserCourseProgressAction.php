<?php

namespace App\Actions\Progress;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use App\Models\UserProgress;

class GetUserCourseProgressAction
{
    public function execute(Course $course): array
    {
        $user = Auth::user();
        // Item-based course summary
        $courseSummary = $course->getUserProgress($user->id);
        // Include total time spent for frontend ProgressCard compatibility
        $totalTimeSpent = (int) UserProgress::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->sum('time_spent_seconds');
        $courseSummary['total_time_spent'] = $totalTimeSpent;

        // Per-module summaries (ordered, no eager moduleItems needed)
        $modules = $course->modules()->ordered()->get();
        $moduleSummaries = $modules->map(function ($module) use ($user) {
            return $module->getUserProgress($user->id);
        })->values();

        // Completed item IDs for client-side highlights if needed
        $completedItemIds = $course->getCompletedModuleItemIds($user->id);
        // Legacy: detailed records list (still used by some UIs)
        $progressRecords = $course->getUserProgressRecords($user->id);

        return [
            'course' => $course->load('modules'),
            'courseSummary' => $courseSummary,
            'moduleSummaries' => $moduleSummaries,
            'completedItemIds' => $completedItemIds,
            // Back-compat
            'progress' => $courseSummary,
            'progressRecords' => $progressRecords,
        ];
    }
}
