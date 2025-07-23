<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\Progress\GetUserCourseProgressAction;
use App\Actions\Progress\MarkCourseItemAsStartedAction;
use App\Actions\Progress\MarkCourseItemAsCompletedAction;
use App\Actions\Progress\UpdateUserTimeSpentOnCourseItemAction;
use App\Actions\Progress\GetOverallUserProgressAction;
use App\Actions\Progress\GetCourseProgressAnalyticsAction;

class ProgressController extends Controller
{
    /**
     * Get user's progress for a course.
     */
    public function show(Course $course, GetUserCourseProgressAction $getUserCourseProgressAction): Response
    {
        $data = $getUserCourseProgressAction->execute($course);

        return Inertia::render('Progress/Show', $data);
    }

    /**
     * Mark an item as started.
     */
    public function markAsStarted(Request $request, Course $course, MarkCourseItemAsStartedAction $markCourseItemAsStartedAction)
    {
        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
        ]);

        $markCourseItemAsStartedAction->execute($course, $validated['course_module_item_id']);

        return response()->json(['message' => 'Item marked as started']);
    }

    /**
     * Mark an item as completed.
     */
    public function markAsCompleted(Request $request, Course $course, MarkCourseItemAsCompletedAction $markCourseItemAsCompletedAction)
    {
        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
        ]);

        $markCourseItemAsCompletedAction->execute($course, $validated['course_module_item_id']);

        return response()->json(['message' => 'Item marked as completed']);
    }

    /**
     * Update time spent on an item.
     */
    public function updateTimeSpent(Request $request, Course $course, UpdateUserTimeSpentOnCourseItemAction $updateUserTimeSpentOnCourseItemAction)
    {
        $validated = $request->validate([
            'course_module_item_id' => 'required|integer|exists:course_module_items,id',
            'time_spent_seconds' => 'required|integer|min:0',
        ]);

        $updateUserTimeSpentOnCourseItemAction->execute($course, $validated['course_module_item_id'], $validated['time_spent_seconds']);

        return response()->json(['message' => 'Time spent updated']);
    }

    /**
     * Get user's overall progress across all courses.
     */
    public function overall(GetOverallUserProgressAction $getOverallUserProgressAction): Response
    {
        $data = $getOverallUserProgressAction->execute();

        return Inertia::render('Progress/Overall', $data);
    }

    /**
     * Get progress analytics for a course (instructor view).
     */
    public function analytics(Course $course, GetCourseProgressAnalyticsAction $getCourseProgressAnalyticsAction): Response
    {
        $this->authorize('viewStats', $course);

        $data = $getCourseProgressAnalyticsAction->execute($course);

        return Inertia::render('Progress/Analytics', $data);
    }
}
