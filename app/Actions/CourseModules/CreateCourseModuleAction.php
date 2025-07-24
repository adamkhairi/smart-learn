<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class CreateCourseModuleAction
{
    public function execute(Course $course, array $data): CourseModule
    {
        // If no order specified, set it to the end
        if (!isset($data['order'])) {
            $data['order'] = $course->modules()->max('order') + 1;
        }

        return $course->modules()->create($data);
    }
}
