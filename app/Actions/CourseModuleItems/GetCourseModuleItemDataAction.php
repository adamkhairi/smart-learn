<?php

namespace App\Actions\CourseModuleItems;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\Assessment;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;

class GetCourseModuleItemDataAction
{
    public function execute(Course $course, CourseModule $module, CourseModuleItem $item, bool $loadForEdit = false): array
    {
        if ($module->course_id !== $course->id || $item->course_module_id !== $module->id) {
            abort(404);
        }

        $item->load('itemable');

        $data = [
            'course' => $course->load('creator'),
            'module' => $module,
            'item' => $item,
        ];

        if (!$loadForEdit) {
            // Logic for 'show' method
            $userSubmission = null;
            if ($item->isAssignment() && $item->itemable) {
                $userSubmission = $item->itemable->submissions()
                    ->where('user_id', Auth::id())
                    ->first();
            } elseif ($item->isAssessment() && $item->itemable) {
                $userSubmission = $item->itemable->submissions()
                    ->where('user_id', Auth::id())
                    ->where('finished', true) // Only get finished submissions
                    ->latest('submitted_at') // Get the most recent finished submission
                    ->first();
            }

            $module->load(['moduleItems' => function ($query) {
                $query->ordered();
            }]);

            $course->created_by = $course->created_by ?? $course->user_id;

            $userProgress = $course->getUserProgressForItem(Auth::id(), $item->id);

            if (!$userProgress || $userProgress->isNotStarted()) {
                $course->markItemAsStarted(Auth::id(), $item->id);
                $userProgress = $course->getUserProgressForItem(Auth::id(), $item->id);
            }

            $completedItems = UserProgress::where('user_id', Auth::id())
                ->where('course_id', $course->id)
                ->where('course_module_id', $module->id)
                ->where('status', 'completed')
                ->pluck('course_module_item_id')
                ->toArray();

            $data['userSubmission'] = $userSubmission;
            $data['userProgress'] = $userProgress;
            $data['completedItems'] = $completedItems;

        } else {
            // Logic for 'edit' method
            if ($item->itemable_type === Assessment::class && $item->itemable) {
                $item->itemable->load(['questions' => function ($query) {
                    $query->orderBy('question_number');
                }]);
            }
        }

        return $data;
    }
}
