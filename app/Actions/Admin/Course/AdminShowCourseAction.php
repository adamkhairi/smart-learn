<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;

class AdminShowCourseAction
{
    public function execute(Course $course): array
    {
        $course->load([
            'creator',
            'enrolledUsers',
            'modules' => function ($query) {
                $query->ordered()->with(['moduleItems' => function ($q) {
                    $q->ordered();
                }]);
            },
            'assignments',
            'assessments',
            'announcements' => function ($query) {
                $query->latest()->limit(10);
            },
            'discussions' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(15);

        return [
            'course' => $course,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ];
    }
}
