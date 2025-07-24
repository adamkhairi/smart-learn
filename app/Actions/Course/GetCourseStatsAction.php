<?php

namespace App\Actions\Course;

use App\Models\Course;

class GetCourseStatsAction
{
    public function execute(Course $course): array
    {
        $stats = [
            'total_students' => $course->getStudents()->count(),
            'total_instructors' => $course->getInstructors()->count(),
            'total_assignments' => $course->assignments()->count(),
            'total_assessments' => $course->assessments()->count(),
            'total_modules' => $course->modules()->count(),
            'total_announcements' => $course->announcements()->count(),
        ];

        return $stats;
    }
}
