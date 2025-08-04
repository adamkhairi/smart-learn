<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Exception;

class BulkDeleteCourseModulesAction
{
    /**
     * Execute the bulk delete action.
     *
     * @param \App\Models\Course $course The course to which the modules belong.
     * @param array $moduleIds An array of module IDs to delete.
     * @return int The number of modules deleted.
     * @throws \Exception If the modules do not belong to the specified course.
     */
    public function execute(Course $course, array $moduleIds): int
    {
        // Ensure all modules belong to the given course
        $modulesToDelete = CourseModule::whereIn('id', $moduleIds)
            ->where('course_id', $course->id)
            ->get();

        if ($modulesToDelete->count() !== count($moduleIds)) {
            throw new Exception('One or more modules do not belong to this course or do not exist.');
        }

        return DB::transaction(function () use ($modulesToDelete) {
            $deletedCount = 0;
            foreach ($modulesToDelete as $module) {
                $module->delete();
                $deletedCount++;
            }
            return $deletedCount;
        });
    }
}
