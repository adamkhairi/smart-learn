<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class UpdateCourseModuleAction
{
    public function execute(Course $course, CourseModule $module, array $data): bool
    {
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        if (isset($data['order']) && $data['order'] !== $module->order) {
            (new UpdateCourseModuleOrderAction())->reorderModules($course, $module, $data['order']);
        }

        return $module->update($data);
    }
}
