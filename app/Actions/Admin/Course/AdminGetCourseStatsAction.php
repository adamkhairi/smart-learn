<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;

class AdminGetCourseStatsAction
{
    public function execute(Course $course): array
    {
        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(20);

        return [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ];
    }
}
