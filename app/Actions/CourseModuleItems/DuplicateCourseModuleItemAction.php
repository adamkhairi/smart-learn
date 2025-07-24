<?php

namespace App\Actions\CourseModuleItems;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use Illuminate\Support\Facades\Storage;
use Exception;

class DuplicateCourseModuleItemAction
{
    public function execute(Course $course, CourseModule $module, CourseModuleItem $item): CourseModuleItem
    {
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        $newItem = $item->replicate();
        $newItem->title = $item->title . ' (Copy)';
        $newItem->order = $module->moduleItems()->max('order') + 1;

        if ($item->type === 'document' && $item->url) {
            $originalPath = $item->url;
            $extension = pathinfo($originalPath, PATHINFO_EXTENSION);
            $filename = pathinfo($originalPath, PATHINFO_FILENAME);
            $newFilename = $filename . '_copy_' . time() . '.' . $extension;
            $newPath = "modules/documents/{$newFilename}";

            if (Storage::disk('public')->exists($originalPath)) {
                Storage::disk('public')->copy($originalPath, $newPath);
                $newItem->url = $newPath;
            }
        }

        $newItem->save();

        return $newItem;
    }
}
