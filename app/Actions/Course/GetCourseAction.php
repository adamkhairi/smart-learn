<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\Category;

class GetCourseAction
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

    public function getEditData(Course $course): array
    {
        $course->load(['creator', 'enrolledUsers']);
        $categories = Category::all();

        return [
            'course' => $course,
            'categories' => $categories,
        ];
    }
}
