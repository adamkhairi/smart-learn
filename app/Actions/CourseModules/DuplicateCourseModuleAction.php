<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class DuplicateCourseModuleAction
{
    public function execute(Course $course, CourseModule $module): CourseModule
    {
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $newModule = $module->replicate();
        $newModule->title = $module->title . ' (Copy)';
        $newModule->order = $course->modules()->max('order') + 1;
        $newModule->is_published = false;
        $newModule->save();

        foreach ($module->moduleItems as $item) {
            $newItem = $item->replicate();
            $newItem->course_module_id = $newModule->id;
            $newItem->save();
        }

        return $newModule;
    }
}
