<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    /**
     * Get user's progress for a course.
     */
    public function show(Course $course): Response
    {
        $user = Auth::user();
        $progress = $course->getUserProgress($user->id);
        $progressRecords = $course->getUserProgressRecords($user->id);

        return Inertia::render('Progress/Show', [
            'course' => $course->load(['modules.moduleItems']),
            'progress' => $progress,
            'progressRecords' => $progressRecords,
        ]);
    }

    /**
     * Mark an item as started.
     */
    public function markAsStarted(Request $request, Course $course)
    {
        \Log::info('Progress markAsStarted called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
        ]);

        $course->markItemAsStarted(Auth::id(), $validated['course_module_item_id']);

        \Log::info('Progress markAsStarted completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $validated['course_module_item_id'],
        ]);

        return response()->json(['message' => 'Item marked as started']);
    }

    /**
     * Mark an item as completed.
     */
    public function markAsCompleted(Request $request, Course $course)
    {
        \Log::info('Progress markAsCompleted called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
        ]);

        $course->markItemAsCompleted(Auth::id(), $validated['course_module_item_id']);

        \Log::info('Progress markAsCompleted completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $validated['course_module_item_id'],
        ]);

        return response()->json(['message' => 'Item marked as completed']);
    }

    /**
     * Update time spent on an item.
     */
    public function updateTimeSpent(Request $request, Course $course)
    {
        \Log::info('Progress updateTimeSpent called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'request_data' => $request->all(),
        ]);

        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
            'time_spent_seconds' => 'required|integer|min:0',
        ]);

        $course->updateUserTimeSpent(Auth::id(), $validated['course_module_item_id'], $validated['time_spent_seconds']);

        \Log::info('Progress updateTimeSpent completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $validated['course_module_item_id'],
            'seconds' => $validated['time_spent_seconds'],
        ]);

        return response()->json(['message' => 'Time spent updated']);
    }

    /**
     * Get user's overall progress across all courses.
     */
    public function overall(): Response
    {
        $user = Auth::user();

        $enrolledCourses = $user->enrollments()->with(['modules.moduleItems'])->get();
        $overallProgress = [];

        foreach ($enrolledCourses as $course) {
            $progress = $course->getUserProgress($user->id);
            $overallProgress[] = [
                'course' => $course,
                'progress' => $progress,
            ];
        }

        return Inertia::render('Progress/Overall', [
            'courses' => $enrolledCourses,
            'overallProgress' => $overallProgress,
        ]);
    }

    /**
     * Get progress analytics for a course (instructor view).
     */
    public function analytics(Course $course): Response
    {
        $this->authorize('viewStats', $course);

        $students = $course->getStudents();
        $studentProgress = [];

        foreach ($students as $student) {
            $progress = $course->getUserProgress($student->id);
            $studentProgress[] = [
                'student' => $student,
                'progress' => $progress,
            ];
        }

        return Inertia::render('Progress/Analytics', [
            'course' => $course,
            'studentProgress' => $studentProgress,
        ]);
    }
}
