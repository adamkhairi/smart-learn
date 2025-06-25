<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\CourseModuleRequest;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CourseModuleController extends Controller
{
    /**
     * Display a listing of course modules.
     */
    public function index(Course $course): Response
    {
        $this->authorize('view', $course);

        $course->load([
            'modules' => function ($query) {
                $query->ordered()->with(['moduleItems' => function ($q) {
                    $q->ordered();
                }]);
            }
        ]);

        return Inertia::render('Courses/Modules/Index', [
            'course' => $course,
            'modules' => $course->modules,
        ]);
    }

    /**
     * Show the form for creating a new course module.
     */
    public function create(Course $course): Response
    {
        $this->authorize('update', $course);

        // Get the next order number
        $nextOrder = $course->modules()->max('order') + 1;

        return Inertia::render('Courses/Modules/Create', [
            'course' => $course,
            'nextOrder' => $nextOrder,
        ]);
    }

    /**
     * Store a newly created course module.
     */
    public function store(CourseModuleRequest $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validated();
        $validated['course_id'] = $course->id;

        // If no order specified, set it to the end
        if (!isset($validated['order'])) {
            $validated['order'] = $course->modules()->max('order') + 1;
        }

        $module = CourseModule::create($validated);

        return redirect()->route('courses.modules.show', [$course, $module])
            ->with('success', 'Module created successfully!');
    }

    /**
     * Display the specified course module.
     */
    public function show(Course $course, CourseModule $module): Response
    {
        $this->authorize('view', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $module->load([
            'moduleItems' => function ($query) {
                $query->ordered();
            }
        ]);

        return Inertia::render('Courses/Modules/Show', [
            'course' => $course,
            'module' => $module,
        ]);
    }

    /**
     * Show the form for editing the specified course module.
     */
    public function edit(Course $course, CourseModule $module): Response
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        return Inertia::render('Courses/Modules/Edit', [
            'course' => $course,
            'module' => $module,
        ]);
    }

    /**
     * Update the specified course module.
     */
    public function update(CourseModuleRequest $request, Course $course, CourseModule $module)
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $validated = $request->validated();

        // Handle order changes
        if (isset($validated['order']) && $validated['order'] !== $module->order) {
            $this->reorderModules($course, $module, $validated['order']);
        }

        $module->update($validated);

        return redirect()->route('courses.modules.show', [$course, $module])
            ->with('success', 'Module updated successfully!');
    }

    /**
     * Remove the specified course module.
     */
    public function destroy(Course $course, CourseModule $module)
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $module->delete();

        // Reorder remaining modules
        $this->reorderRemainingModules($course);

        return redirect()->route('courses.modules.index', $course)
            ->with('success', 'Module deleted successfully!');
    }

    /**
     * Update the order of modules.
     */
    public function updateOrder(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:course_modules,id',
            'modules.*.order' => 'required|integer|min:1',
        ]);

        foreach ($validated['modules'] as $moduleData) {
            CourseModule::where('id', $moduleData['id'])
                ->where('course_id', $course->id)
                ->update(['order' => $moduleData['order']]);
        }

        return back()->with('success', 'Module order updated successfully!');
    }

    /**
     * Toggle module published status.
     */
    public function togglePublished(Course $course, CourseModule $module)
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $module->update(['is_published' => !$module->is_published]);

        $status = $module->is_published ? 'published' : 'unpublished';

        return back()->with('success', "Module {$status} successfully!");
    }

    /**
     * Duplicate a module.
     */
    public function duplicate(Course $course, CourseModule $module)
    {
        $this->authorize('update', $course);

        // Ensure the module belongs to the course
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $newModule = $module->replicate();
        $newModule->title = $module->title . ' (Copy)';
        $newModule->order = $course->modules()->max('order') + 1;
        $newModule->is_published = false;
        $newModule->save();

        // Duplicate module items
        foreach ($module->moduleItems as $item) {
            $newItem = $item->replicate();
            $newItem->course_module_id = $newModule->id;
            $newItem->save();
        }

        return redirect()->route('courses.modules.edit', [$course, $newModule])
            ->with('success', 'Module duplicated successfully!');
    }

    /**
     * Reorder modules when changing a module's order.
     */
    private function reorderModules(Course $course, CourseModule $module, int $newOrder): void
    {
        $oldOrder = $module->order;

        if ($newOrder > $oldOrder) {
            // Moving down: decrease order of modules between old and new position
            $course->modules()
                ->where('order', '>', $oldOrder)
                ->where('order', '<=', $newOrder)
                ->where('id', '!=', $module->id)
                ->decrement('order');
        } else {
            // Moving up: increase order of modules between new and old position
            $course->modules()
                ->where('order', '>=', $newOrder)
                ->where('order', '<', $oldOrder)
                ->where('id', '!=', $module->id)
                ->increment('order');
        }
    }

    /**
     * Reorder remaining modules after deletion.
     */
    private function reorderRemainingModules(Course $course): void
    {
        $modules = $course->modules()->ordered()->get();

        foreach ($modules as $index => $module) {
            $module->update(['order' => $index + 1]);
        }
    }
}
