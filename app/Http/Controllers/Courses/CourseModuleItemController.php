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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\RedirectResponse;

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
    public function store(CourseModuleItemRequest $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        try {
            $validated = $request->validated();

            // If no order specified, set it to the end
            if (!isset($validated['order'])) {
                $validated['order'] = $module->moduleItems()->max('order') + 1;
            }

            // Create the appropriate itemable model based on type
            $itemable = null;

            switch ($validated['item_type']) {
                case 'lecture':
                    $itemable = Lecture::create([
                        'title' => $validated['title'],
                        'description' => $validated['description'],
                        'video_url' => $validated['video_url'] ?? null,
                        'duration' => $validated['duration'] ?? null,
                        'content' => $validated['content'] ?? null,
                        'course_id' => $course->id,
                        'course_module_id' => $module->id,
                        'created_by' => auth()->id(),
                        'order' => $validated['order'],
                        'is_published' => ($validated['status'] ?? 'published') === 'published',
                    ]);
                    break;

                case 'assessment':
                    $itemable = Assessment::create([
                        'title' => $validated['assessment_title'],
                        'type' => $validated['assessment_type'] ?? 'quiz',
                        'max_score' => $validated['max_score'] ?? 100,
                        'questions_type' => $validated['questions_type'] ?? 'online',
                        'submission_type' => $validated['submission_type'] ?? 'online',
                        'visibility' => ($validated['status'] ?? 'published') === 'published' ? 'published' : 'unpublished',
                        'course_id' => $course->id,
                        'created_by' => auth()->id(),
                    ]);
                    break;

                case 'assignment':
                    $itemable = Assignment::create([
                        'title' => $validated['assignment_title'],
                        'assignment_type' => $validated['assignment_type'] ?? 'general',
                        'total_points' => $validated['total_points'] ?? 100,
                        'status' => 'open', // Default status
                        'visibility' => true,
                        'started_at' => $validated['started_at'] ?? now(),
                        'expired_at' => $validated['expired_at'] ?? null,
                        'course_id' => $course->id,
                        'created_by' => auth()->id(),
                    ]);
                    break;

                default:
                    throw new Exception('Invalid item type specified.');
            }

            // Create the CourseModuleItem with polymorphic relationship
            $moduleItem = CourseModuleItem::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'course_module_id' => $module->id,
                'itemable_id' => $itemable->id,
                'itemable_type' => get_class($itemable),
                'order' => $validated['order'],
                'is_required' => $validated['is_required'] ?? false,
                'status' => $validated['status'] ?? 'published',
            ]);

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

        // Load module with all items for navigation
        $module->load(['moduleItems' => function ($query) {
            $query->ordered();
        }]);

        // Add created_by field to course for frontend compatibility
        $course->created_by = $course->created_by ?? $course->user_id;

        return Inertia::render('Courses/Modules/Items/Show', [
            'course' => $course->load('creator'),
            'module' => $module,
            'item' => $item,
            // TODO: Add user progress tracking for completedItems
            'completedItems' => [], // This would come from user progress tracking
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

        return Inertia::render('Courses/Modules/Items/Edit', [
            'course' => $course->load('creator'),
            'module' => $module,
            'item' => $item,
        ]);
    }

    /**
     * Update the specified module item.
     */
    public function update(CourseModuleItemRequest $request, Course $course, CourseModule $module, CourseModuleItem $item): RedirectResponse
    {
        $this->authorize('update', $course);

        // Ensure the hierarchy is correct
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            $validated = $request->validated();

            // Handle order changes
            if (isset($validated['order']) && $validated['order'] !== $item->order) {
                $this->reorderItems($module, $item, $validated['order']);
            }

            // Update the polymorphic itemable model
            if ($item->itemable) {
                switch ($validated['item_type']) {
                    case 'lecture':
                        $item->itemable->update([
                            'title' => $validated['title'],
                            'description' => $validated['description'],
                            'video_url' => $validated['video_url'] ?? null,
                            'duration' => $validated['duration'] ?? null,
                            'content' => $validated['content'] ?? null,
                            'is_published' => ($validated['status'] ?? 'published') === 'published',
                        ]);
                        break;

                    case 'assessment':
                        $item->itemable->update([
                            'title' => $validated['assessment_title'],
                            'type' => $validated['assessment_type'] ?? 'quiz',
                            'max_score' => $validated['max_score'] ?? 100,
                            'questions_type' => $validated['questions_type'] ?? 'online',
                            'submission_type' => $validated['submission_type'] ?? 'online',
                            'visibility' => ($validated['status'] ?? 'published') === 'published' ? 'published' : 'unpublished',
                        ]);
                        break;

                    case 'assignment':
                        $item->itemable->update([
                            'title' => $validated['assignment_title'],
                            'assignment_type' => $validated['assignment_type'] ?? 'general',
                            'total_points' => $validated['total_points'] ?? 100,
                            'started_at' => $validated['started_at'] ?? $item->itemable->started_at,
                            'expired_at' => $validated['expired_at'] ?? null,
                            'visibility' => ($validated['status'] ?? 'published') === 'published',
                        ]);
                        break;
                }
            }

            // Update the CourseModuleItem
            $item->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'order' => $validated['order'],
                'is_required' => $validated['is_required'] ?? false,
                'status' => $validated['status'] ?? 'published',
            ]);

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
