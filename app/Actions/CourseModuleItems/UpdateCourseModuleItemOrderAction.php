<?php

namespace App\Actions\CourseModuleItems;

use App\Models\CourseModule;
use App\Models\CourseModuleItem;

class UpdateCourseModuleItemOrderAction
{
    public function updateOrder(CourseModule $module, array $itemsData): void
    {
        foreach ($itemsData as $itemData) {
            CourseModuleItem::where('id', $itemData['id'])
                ->where('course_module_id', $module->id)
                ->update(['order' => $itemData['order']]);
        }
    }

    public function reorderItems(CourseModule $module, CourseModuleItem $item, int $newOrder): void
    {
        $oldOrder = $item->order;

        if ($newOrder > $oldOrder) {
            $module->moduleItems()
                ->where('order', '>', $oldOrder)
                ->where('order', '<=', $newOrder)
                ->where('id', '!=', $item->id)
                ->decrement('order');
        } else {
            $module->moduleItems()
                ->where('order', '>=', $newOrder)
                ->where('order', '<', $oldOrder)
                ->where('id', '!=', $item->id)
                ->increment('order');
        }
    }

    public function reorderRemainingItems(CourseModule $module): void
    {
        $items = $module->moduleItems()->ordered()->get();

        foreach ($items as $index => $item) {
            $item->update(['order' => $index + 1]);
        }
    }
}
