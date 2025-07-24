<?php

namespace App\Actions\Course;

use App\Models\Course;

class ToggleCourseStatusAction
{
    public function execute(Course $course): string
    {
        $newStatus = $course->status === 'published' ? 'archived' : 'published';
        $course->update(['status' => $newStatus]);

        return $newStatus;
    }
}
