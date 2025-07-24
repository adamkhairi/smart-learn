<?php

namespace App\Actions\CourseModuleItems;

use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use Exception;

class DeleteCourseModuleItemAction
{
    public function execute(CourseModule $module, CourseModuleItem $item): string
    {
        if ($item->course_module_id !== $module->id) {
            abort(404);
        }

        $itemTitle = $item->title;

        // Delete the polymorphic itemable model first
        if ($item->itemable) {
            $item->itemable->delete();
        }

        // Delete the CourseModuleItem
        $item->delete();

        // Reorder remaining items
        (new UpdateCourseModuleItemOrderAction())->reorderRemainingItems($module);

        return "Module item '{$itemTitle}' deleted successfully!";
    }
}
