<?php

namespace App\Actions\Progress;

use App\Models\Course;

class GetCourseProgressAnalyticsAction
{
    public function execute(Course $course): array
    {
        $students = $course->getStudents();
        $studentProgress = [];

        foreach ($students as $student) {
            $progress = $course->getUserProgress($student->id);
            $studentProgress[] = [
                'student' => $student,
                'progress' => $progress,
            ];
        }

        return [
            'course' => $course,
            'studentProgress' => $studentProgress,
        ];
    }
}
