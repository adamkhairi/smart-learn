<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\CourseModuleItemRequest;
use App\Models\Assignment;
use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\Lecture;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\RedirectResponse;
use App\Actions\CourseModuleItems\CreateCourseModuleItemAction;
use App\Actions\CourseModuleItems\UpdateCourseModuleItemAction;
use Illuminate\Support\Facades\Auth;

class CourseModuleItemController extends Controller
{
    /**
     * Show the form for creating a new module item.
     */
    public function create(Course $course, CourseModule $module): Response
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        // Get the next order number
        $nextOrder = $module->moduleItems()->max('order') + 1;

        return Inertia::render('Courses/Modules/Items/Create', [
            'course' => $course->load('creator'),
            'module' => $module,
            'nextOrder' => $nextOrder,
        ]);
    }

    /**
     * Store a newly created module item.
     */
    public function store(
        CourseModuleItemRequest $request,
        Course $course,
        CourseModule $module,
        CreateCourseModuleItemAction $createCourseModuleItemAction
    ): RedirectResponse {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id) {
            abort(404);
        }

        try {
            $moduleItem = $createCourseModuleItemAction->execute($course, $module, $request->validated());

            return redirect()
                ->route('courses.modules.show', [$course, $module])
                ->with('success', "Module item '{$moduleItem->title}' created successfully!");
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create module item. Please try again. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified module item.
     */
    public function show(Course $course, CourseModule $module, CourseModuleItem $item): Response
    {
        $this->authorize('view', $course);

        // Ensure the hierarchy is correct
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        // Load the polymorphic relationship
        $item->load('itemable');

        // If this is an assignment, load user's submission
        $userSubmission = null;
        if ($item->isAssignment() && $item->itemable) {
            $userSubmission = $item->itemable->submissions()
                ->where('user_id', Auth::id())
                ->first();
        }

        // Load module with all items for navigation
        $module->load(['moduleItems' => function ($query) {
            $query->ordered();
        }]);

        // Add created_by field to course for frontend compatibility
        $course->created_by = $course->created_by ?? $course->user_id;

        // Get user progress for this item
        $userProgress = $course->getUserProgressForItem(Auth::id(), $item->id);

        // Mark item as started if not already started
        if (!$userProgress || $userProgress->isNotStarted()) {
            $course->markItemAsStarted(Auth::id(), $item->id);
            $userProgress = $course->getUserProgressForItem(Auth::id(), $item->id);
        }

        // Get completed items for this module
        $completedItems = UserProgress::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->where('course_module_id', $module->id)
            ->where('status', 'completed')
            ->pluck('course_module_item_id')
            ->toArray();

        return Inertia::render('Courses/Modules/Items/Show', [
            'course' => $course->load('creator'),
            'module' => $module,
            'item' => $item,
            'userSubmission' => $userSubmission,
            'userProgress' => $userProgress,
            'completedItems' => $completedItems,
        ]);
    }

    /**
     * Show the form for editing the specified module item.
     */
    public function edit(Course $course, CourseModule $module, CourseModuleItem $item): Response
    {
        $this->authorize('update', $course);

        // Ensure the hierarchy is correct
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        // Load the polymorphic relationship
        $item->load('itemable');

        // Load questions for assessments
        if ($item->itemable_type === Assessment::class && $item->itemable) {
            $item->itemable->load(['questions' => function ($query) {
                $query->orderBy('question_number');
            }]);
        }

        return Inertia::render('Courses/Modules/Items/Edit', [
            'course' => $course->load('creator'),
            'module' => $module,
            'item' => $item,
        ]);
    }

    /**
     * Update the specified module item.
     */
    public function update(
        CourseModuleItemRequest $request,
        Course $course,
        CourseModule $module,
        CourseModuleItem $item,
        UpdateCourseModuleItemAction $updateCourseModuleItemAction
    ): RedirectResponse {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            if (isset($request->validated()['order']) && $request->validated()['order'] !== $item->order) {
                $this->reorderItems($module, $item, $request->validated()['order']);
            }

            $item = $updateCourseModuleItemAction->execute($item, $request->validated());

            return redirect()
                ->route('courses.modules.show', [$course, $module])
                ->with('success', "Module item '{$item->title}' updated successfully!");
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update module item. Please try again. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified module item.
     */
    public function destroy(Course $course, CourseModule $module, CourseModuleItem $item): RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure the hierarchy is correct
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            $itemTitle = $item->title;

            // Delete the polymorphic itemable model first
            if ($item->itemable) {
                $item->itemable->delete();
            }

            // Delete the CourseModuleItem
            $item->delete();

            // Reorder remaining items
            $this->reorderRemainingItems($module);

            return redirect()
                ->route('courses.modules.show', [$course, $module])
                ->with('success', "Module item '{$itemTitle}' deleted successfully!");

        } catch (Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete module item. Please try again.']);
        }
    }

    /**
     * Update the order of module items.
     */
    public function updateOrder(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|exists:course_module_items,id',
                'items.*.order' => 'required|integer|min:1',
            ]);

            foreach ($validated['items'] as $itemData) {
                CourseModuleItem::where('id', $itemData['id'])
                    ->where('course_module_id', $module->id)
                    ->update(['order' => $itemData['order']]);
            }

            return back()->with('success', 'Item order updated successfully!');

        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to update item order.']);
        }
    }

    /**
     * Duplicate a module item.
     */
    public function duplicate(Course $course, CourseModule $module, CourseModuleItem $item): RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure the hierarchy is correct
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            $newItem = $item->replicate();
            $newItem->title = $item->title . ' (Copy)';
            $newItem->order = $module->moduleItems()->max('order') + 1;

            // Handle file duplication for documents
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

            return redirect()
                ->route('courses.modules.items.edit', [$course, $module, $newItem])
                ->with('success', "Module item '{$newItem->title}' duplicated successfully!");

        } catch (Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to duplicate module item. Please try again.']);
        }
    }

    /**
     * Reorder items when changing an item's order.
     */
    private function reorderItems(CourseModule $module, CourseModuleItem $item, int $newOrder): void
    {
        $oldOrder = $item->order;

        if ($newOrder > $oldOrder) {
            // Moving down: decrease order of items between old and new position
            $module->moduleItems()
                ->where('order', '>', $oldOrder)
                ->where('order', '<=', $newOrder)
                ->where('id', '!=', $item->id)
                ->decrement('order');
        } else {
            // Moving up: increase order of items between new and old position
            $module->moduleItems()
                ->where('order', '>=', $newOrder)
                ->where('order', '<', $oldOrder)
                ->where('id', '!=', $item->id)
                ->increment('order');
        }
    }

    /**
     * Reorder remaining items after deletion.
     */
    private function reorderRemainingItems(CourseModule $module): void
    {
        $items = $module->moduleItems()->ordered()->get();

        foreach ($items as $index => $item) {
            $item->update(['order' => $index + 1]);
        }
    }
}
