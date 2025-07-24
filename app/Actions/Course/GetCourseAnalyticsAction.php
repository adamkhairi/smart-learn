<?php

namespace App\Actions\Course;

use App\Models\Course;

class GetCourseAnalyticsAction
{
    public function execute(Course $course): array
    {
        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(50);

        // Get enrollment trends (last 30 days)
        $enrollmentTrends = $course->enrolledUsers()
            ->wherePivot('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(course_user_enrollments.created_at) as date, COUNT(*) as count')
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
