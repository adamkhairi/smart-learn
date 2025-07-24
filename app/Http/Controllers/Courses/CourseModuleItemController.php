<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\CourseModuleItemRequest;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use Inertia\Inertia;
use Inertia\Response;
use Exception;
use Illuminate\Http\RedirectResponse;
use App\Actions\CourseModuleItems\CreateCourseModuleItemAction;
use App\Actions\CourseModuleItems\UpdateCourseModuleItemAction;
use App\Actions\CourseModuleItems\GetCourseModuleItemDataAction;
use App\Actions\CourseModuleItems\DeleteCourseModuleItemAction;
use App\Actions\CourseModuleItems\UpdateCourseModuleItemOrderAction;
use App\Actions\CourseModuleItems\DuplicateCourseModuleItemAction;
use Illuminate\Http\Request;

class CourseModuleItemController extends Controller
{
    /**
     * Show the form for creating a new module item.
     */
    public function create(Course $course, CourseModule $module): Response
    {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id) {
            abort(404);
        }

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
    public function show(Course $course, CourseModule $module, CourseModuleItem $item, GetCourseModuleItemDataAction $getCourseModuleItemDataAction): Response
    {
        $this->authorize('view', $course);

        $data = $getCourseModuleItemDataAction->execute($course, $module, $item);

        return Inertia::render('Courses/Modules/Items/Show', $data);
    }

    /**
     * Show the form for editing the specified module item.
     */
    public function edit(Course $course, CourseModule $module, CourseModuleItem $item, GetCourseModuleItemDataAction $getCourseModuleItemDataAction): Response
    {
        $this->authorize('update', $course);

        $data = $getCourseModuleItemDataAction->execute($course, $module, $item, true);

        return Inertia::render('Courses/Modules/Items/Edit', $data);
    }

    /**
     * Update the specified module item.
     */
    public function update(
        CourseModuleItemRequest $request,
        Course $course,
        CourseModule $module,
        CourseModuleItem $item,
        UpdateCourseModuleItemAction $updateCourseModuleItemAction,
        UpdateCourseModuleItemOrderAction $updateCourseModuleItemOrderAction
    ): RedirectResponse {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            if (isset($request->validated()['order']) && $request->validated()['order'] !== $item->order) {
                $updateCourseModuleItemOrderAction->reorderItems($module, $item, $request->validated()['order']);
            }

            $updatedItem = $updateCourseModuleItemAction->execute($item, $request->validated());

            return redirect()
                ->route('courses.modules.show', [$course, $module])
                ->with('success', "Module item '{$updatedItem->title}' updated successfully!");
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update module item. Please try again. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified module item.
     */
    public function destroy(Course $course, CourseModule $module, CourseModuleItem $item, DeleteCourseModuleItemAction $deleteCourseModuleItemAction): RedirectResponse
    {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            $message = $deleteCourseModuleItemAction->execute($module, $item);

            return redirect()
                ->route('courses.modules.show', [$course, $module])
                ->with('success', $message);

        } catch (Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete module item. Please try again.']);
        }
    }

    /**
     * Update the order of module items.
     */
    public function updateOrder(Request $request, Course $course, CourseModule $module, UpdateCourseModuleItemOrderAction $updateCourseModuleItemOrderAction): RedirectResponse
    {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id) {
            abort(404);
        }

        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|exists:course_module_items,id',
                'items.*.order' => 'required|integer|min:1',
            ]);

            $updateCourseModuleItemOrderAction->updateOrder($module, $validated['items']);

            return back()->with('success', 'Item order updated successfully!');

        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to update item order.']);
        }
    }

    /**
     * Duplicate a module item.
     */
    public function duplicate(Course $course, CourseModule $module, CourseModuleItem $item, DuplicateCourseModuleItemAction $duplicateCourseModuleItemAction): RedirectResponse
    {
        $this->authorize('update', $course);

        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        try {
            $newItem = $duplicateCourseModuleItemAction->execute($course, $module, $item);

            return redirect()
                ->route('courses.modules.items.edit', [$course, $module, $newItem])
                ->with('success', "Module item '{$newItem->title}' duplicated successfully!");

        } catch (Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to duplicate module item. Please try again.']);
        }
    }
}
