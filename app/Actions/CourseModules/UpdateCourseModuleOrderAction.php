<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;

class UpdateCourseModuleOrderAction
{
    public function updateOrder(Course $course, array $modulesData): void
    {
        foreach ($modulesData as $moduleData) {
            CourseModule::where('id', $moduleData['id'])
                ->where('course_id', $course->id)
                ->update(['order' => $moduleData['order']]);
        }
    }

    public function reorderModules(Course $course, CourseModule $module, int $newOrder): void
    {
        $oldOrder = $module->order;

        if ($newOrder > $oldOrder) {
            $course->modules()
                ->where('order', '>', $oldOrder)
                ->where('order', '<=', $newOrder)
                ->where('id', '!=', $module->id)
                ->decrement('order');
        } else {
            $course->modules()
                ->where('order', '>=', $newOrder)
                ->where('order', '<', $oldOrder)
                ->where('id', '!=', $module->id)
                ->increment('order');
        }
    }

    public function reorderRemainingModules(Course $course): void
    {
        $modules = $course->modules()->ordered()->get();

        foreach ($modules as $index => $module) {
            $module->update(['order' => $index + 1]);
        }
    }
}
