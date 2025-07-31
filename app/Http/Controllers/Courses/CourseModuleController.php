<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\CourseModuleRequest;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\CourseModules\ListCourseModulesAction;
use App\Actions\CourseModules\CreateCourseModuleAction;
use App\Actions\CourseModules\ShowCourseModuleAction;
use App\Actions\CourseModules\UpdateCourseModuleAction;
use App\Actions\CourseModules\DeleteCourseModuleAction;
use App\Actions\CourseModules\UpdateCourseModuleOrderAction;
use App\Actions\CourseModules\ToggleCourseModulePublishedStatusAction;
use App\Actions\CourseModules\DuplicateCourseModuleAction;
use App\Actions\CourseModules\BulkDeleteCourseModulesAction;
use Exception;
use Illuminate\Http\RedirectResponse;

class CourseModuleController extends Controller
{
    /**
     * Display a listing of course modules.
     */
    public function index(Course $course, ListCourseModulesAction $listCourseModulesAction): Response
    {
        $this->authorize('view', $course);

        $modules = $listCourseModulesAction->execute($course);

        return Inertia::render('Courses/Modules/Index', [
            'course' => $course,
            'modules' => $modules,
        ]);
    }

    /**
     * Show the form for creating a new course module.
     */
    public function create(Course $course): Response
    {
        $this->authorize('update', $course);

        $nextOrder = $course->modules()->max('order') + 1;

        return Inertia::render('Courses/Modules/Create', [
            'course' => $course,
            'nextOrder' => $nextOrder,
        ]);
    }

    /**
     * Store a newly created course module.
     */
    public function store(CourseModuleRequest $request, Course $course, CreateCourseModuleAction $createCourseModuleAction)
    {
        $this->authorize('update', $course);

        $validated = $request->validated();
        $validated['course_id'] = $course->id;

        try {
            $module = $createCourseModuleAction->execute($course, $validated);

            return redirect()->route('courses.modules.show', [$course, $module])
                ->with('success', 'Module created successfully!');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create module. Please try again. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified course module.
     */
    public function show(Course $course, CourseModule $module, ShowCourseModuleAction $showCourseModuleAction): Response
    {
        $this->authorize('view', $course);

        try {
            $data = $showCourseModuleAction->execute($course, $module);
            return Inertia::render('Courses/Modules/Show', $data);
        } catch (Exception $e) {
            abort(403, $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified course module.
     */
    public function edit(Course $course, CourseModule $module): Response
    {
        $this->authorize('update', $course);

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
    public function update(CourseModuleRequest $request, Course $course, CourseModule $module, UpdateCourseModuleAction $updateCourseModuleAction)
    {
        $this->authorize('update', $course);

        try {
            $updateCourseModuleAction->execute($course, $module, $request->validated());

            return redirect()->route('courses.modules.show', [$course, $module])
                ->with('success', 'Module updated successfully!');
        } catch (Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update module. Please try again. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified course module.
     */
    public function destroy(Course $course, CourseModule $module, DeleteCourseModuleAction $deleteCourseModuleAction)
    {
        $this->authorize('update', $course);

        try {
            $deleteCourseModuleAction->execute($course, $module);

            return redirect()->route('courses.modules.index', $course)
                ->with('success', 'Module deleted successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete module. Please try again.']);
        }
    }

    /**
     * Update the order of modules.
     */
    public function updateOrder(Request $request, Course $course, UpdateCourseModuleOrderAction $updateCourseModuleOrderAction)
    {
        $this->authorize('update', $course);

        if ($course->modules()->whereIn('id', collect($request->modules)->pluck('id'))->count() !== count($request->modules)) {
            abort(404);
        }

        $validated = $request->validate([
            'modules' => 'required|array',
            'modules.*.id' => 'required|exists:course_modules,id',
            'modules.*.order' => 'required|integer|min:1',
        ]);

        try {
            $updateCourseModuleOrderAction->updateOrder($course, $validated['modules']);

            return back()->with('success', 'Module order updated successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to update module order.']);
        }
    }

    /**
     * Toggle module published status.
     */
    public function togglePublished(Course $course, CourseModule $module, ToggleCourseModulePublishedStatusAction $toggleCourseModulePublishedStatusAction)
    {
        $this->authorize('update', $course);

        try {
            $toggleCourseModulePublishedStatusAction->execute($course, $module);

            $status = $module->is_published ? 'published' : 'unpublished';
            return back()->with('success', "Module {$status} successfully!");
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Duplicate a module.
     */
    public function duplicate(Course $course, CourseModule $module, DuplicateCourseModuleAction $duplicateCourseModuleAction)
    {
        $this->authorize('update', $course);

        try {
            $newModule = $duplicateCourseModuleAction->execute($course, $module);

            return redirect()->route('courses.modules.edit', [$course, $newModule])
                ->with('success', 'Module duplicated successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Bulk delete course modules.
     */
    public function bulkDelete(
        Request $request,
        Course $course,
        BulkDeleteCourseModulesAction $bulkDeleteCourseModulesAction
    ): RedirectResponse {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'module_ids' => 'required|array',
            'module_ids.*' => 'required|exists:course_modules,id',
        ]);

        try {
            $deletedCount = $bulkDeleteCourseModulesAction->execute($course, $validated['module_ids']);

            return back()->with('success', "Successfully deleted {$deletedCount} modules.");
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to bulk delete modules: ' . $e->getMessage()]);
        }
    }
}
