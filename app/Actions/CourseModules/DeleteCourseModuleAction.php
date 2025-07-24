<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class DeleteCourseModuleAction
{
    public function execute(Course $course, CourseModule $module): bool
    {
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $module->delete();

        (new UpdateCourseModuleOrderAction())->reorderRemainingModules($course);

        return true;
    }
}
