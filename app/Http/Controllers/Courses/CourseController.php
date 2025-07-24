<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\Course\ListCoursesAction;
use App\Actions\Course\CreateCourseFormAction;
use App\Actions\Course\StoreCourseAction;
use App\Actions\Course\ShowCourseAction;
use App\Actions\Course\PublicShowCourseAction;
use App\Actions\Course\EditCourseFormAction;
use App\Actions\Course\UpdateCourseAction;
use App\Actions\Course\DeleteCourseAction;
use App\Actions\Course\EnrollUserAction;
use App\Actions\Course\UnenrollUserAction;
use App\Actions\Course\GetCourseStatsAction;
use App\Actions\Course\EnrollmentRequestAction;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request, ListCoursesAction $action): Response
    {
        $data = $action->execute($request);

        return Inertia::render('Courses/Index', $data);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create(CreateCourseFormAction $action): Response
    {
        $this->authorize('create', Course::class);

        $data = $action->execute();

        return Inertia::render('Courses/Create', $data);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request, StoreCourseAction $action)
    {
        $this->authorize('create', Course::class);

        try {
            $course = $action->execute($request);

            return redirect()->route('courses.show', $course)
                ->with('success', 'Course created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create course. Please try again.');
        }
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course, ShowCourseAction $action): Response
    {
        $this->authorize('view', $course);

        $data = $action->execute($course);

        return Inertia::render('Courses/Show', $data);
    }

    /**
     * Display the specified course for public/unenrolled users.
     */
    public function publicShow(Course $course, PublicShowCourseAction $action): Response
    {
        $data = $action->execute($course);

        // If the course is private or not published
        if ($course->is_private || $course->status !== 'published') {
            // Guests are redirected to the courses index
            if (!auth()->check()) {
                return redirect()->route('courses.index')->with('error', 'This course is not publicly available or does not exist.');
            }
            // Authenticated users who are not admin, creator, or enrolled are denied access
            if (!auth()->user()->isAdmin() && $course->created_by !== auth()->id() && !$course->enrolledUsers()->where('user_id', auth()->id())->exists()) {
                abort(403, 'You do not have access to this course.');
            }
        }

        return Inertia::render('Courses/PublicShow', $data);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course, EditCourseFormAction $action): Response
    {
        $this->authorize('update', $course);

        $data = $action->execute($course);

        return Inertia::render('Courses/Edit', $data);
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course, UpdateCourseAction $action)
    {
        $this->authorize('update', $course);

        try {
            $action->execute($request, $course);

            return redirect()->route('courses.index')->with('success', 'Course updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            return back()->with('error', 'An unexpected error occurred while updating the course.')->withInput();
        }
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course, DeleteCourseAction $action)
    {
        $this->authorize('delete', $course);

        try {
            $action->execute($course);

            return redirect()->route('courses.index')
                ->with('success', 'Course deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete course. Please try again.');
        }
    }

    /**
     * Enroll a user in the course.
     */
    public function enroll(Request $request, Course $course, EnrollUserAction $action)
    {
        $this->authorize('enroll', $course);

        try {
            $action->execute($request, $course);
            return back()->with('success', 'User enrolled successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Unenroll a user from the course.
     */
    public function unenroll(Request $request, Course $course, UnenrollUserAction $action)
    {
        $this->authorize('unenroll', $course);

        try {
            $action->execute($request, $course);
            return back()->with('success', 'User unenrolled successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get course statistics.
     */
    public function stats(Course $course, GetCourseStatsAction $action)
    {
        $this->authorize('viewStats', $course);

        $stats = $action->execute($course);

        return response()->json($stats);
    }

    /**
     * Handle a user's request to enroll in a course.
     */
    public function enrollmentRequest(Request $request, Course $course, EnrollmentRequestAction $action)
    {
        $result = $action->execute($request, $course);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        } else {
            if ($result['status'] === 401) {
                return response()->json(['message' => $result['message']], 401);
            }
            return back()->with('error', $result['message']);
        }
    }
}
