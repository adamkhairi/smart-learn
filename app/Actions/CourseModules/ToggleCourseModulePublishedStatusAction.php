<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class ToggleCourseModulePublishedStatusAction
{
    public function execute(Course $course, CourseModule $module): bool
    {
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        return $module->update(['is_published' => !$module->is_published]);
    }
}
