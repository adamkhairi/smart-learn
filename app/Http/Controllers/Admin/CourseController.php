<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\Admin\Course\AdminListCoursesAction;
use App\Actions\Admin\Course\AdminCreateCourseFormAction;
use App\Actions\Admin\Course\AdminStoreCourseAction;
use App\Actions\Admin\Course\AdminShowCourseAction;
use App\Actions\Admin\Course\AdminEditCourseFormAction;
use App\Actions\Admin\Course\AdminUpdateCourseAction;
use App\Actions\Course\DeleteCourseAction;
use App\Actions\Admin\Course\ToggleCourseStatusAction;
use App\Actions\Admin\Course\AdminGetCourseStatsAction;
use App\Actions\Admin\Course\ManageCourseEnrollmentsAction;
use App\Actions\Admin\Course\AdminEnrollUsersAction;
use App\Actions\Admin\Course\AdminUnenrollUsersAction;
use App\Actions\Admin\Course\GetCourseAnalyticsAction;

class CourseController extends Controller
{
    /**
     * Display a listing of courses with management features.
     */
    public function index(Request $request, AdminListCoursesAction $action): Response
    {
        $data = $action->execute($request);

        return Inertia::render('Admin/Courses/Index', $data);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create(AdminCreateCourseFormAction $action): Response
    {
        $data = $action->execute();

        return Inertia::render('Admin/Courses/Create', $data);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request, AdminStoreCourseAction $action)
    {
        try {
            $course = $action->execute($request);

            return redirect()->route('admin.courses.index')
                ->with('success', 'Course created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create course. Please try again.');
        }
    }

    /**
     * Display the specified course with detailed information.
     */
    public function show(Course $course, AdminShowCourseAction $action): Response
    {
        $data = $action->execute($course);

        return Inertia::render('Admin/Courses/Show', $data);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course, AdminEditCourseFormAction $action): Response
    {
        $data = $action->execute($course);

        return Inertia::render('Admin/Courses/Edit', $data);
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course, AdminUpdateCourseAction $action)
    {
        try {
            $action->execute($request, $course);

            return redirect()->route('admin.courses.index')
                ->with('success', 'Course updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update course. Please try again.');
        }
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course, DeleteCourseAction $action)
    {
        try {
            $action->execute($course);

            return redirect()->route('admin.courses.index')
                ->with('success', 'Course deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete course. Please try again.');
        }
    }

    /**
     * Toggle course status.
     */
    public function toggleStatus(Course $course, ToggleCourseStatusAction $action)
    {
        $newStatus = $action->execute($course);

        return back()->with('success', "Course {$newStatus} successfully!");
    }

    /**
     * Get course statistics.
     */
    public function stats(Course $course, AdminGetCourseStatsAction $action)
    {
        $data = $action->execute($course);

        return response()->json($data);
    }

    /**
     * Manage course enrollments.
     */
    public function manageEnrollments(Request $request, Course $course, ManageCourseEnrollmentsAction $action)
    {
        $data = $action->execute($request, $course);

        return Inertia::render('Admin/Courses/Enrollments', $data);
    }

    /**
     * Enroll users in course.
     */
    public function enrollUsers(Request $request, Course $course, AdminEnrollUsersAction $action)
    {
        $enrolledCount = $action->execute($request, $course);

        return back()->with('success', "{$enrolledCount} users enrolled successfully!");
    }

    /**
     * Unenroll users from course.
     */
    public function unenrollUsers(Request $request, Course $course, AdminUnenrollUsersAction $action)
    {
        $unenrolledCount = $action->execute($request, $course);

        return back()->with('success', "{$unenrolledCount} users unenrolled successfully!");
    }

    /**
     * Get course analytics.
     */
    public function analytics(Course $course, GetCourseAnalyticsAction $action)
    {
        $data = $action->execute($course);

        return Inertia::render('Admin/Courses/Analytics', $data);
    }
}
