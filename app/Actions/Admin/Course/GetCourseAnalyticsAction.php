<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use Illuminate\Support\Facades\DB;

class GetCourseAnalyticsAction
{
    public function execute(Course $course): array
    {
        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(50);

        // Get enrollment trends (last 30 days)
        // Query the pivot table directly to avoid implicit pivot/user column selection
        $enrollmentTrends = DB::table('course_user_enrollments')
            ->where('course_id', $course->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'course' => $course,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'enrollmentTrends' => $enrollmentTrends,
        ];
    }
}
