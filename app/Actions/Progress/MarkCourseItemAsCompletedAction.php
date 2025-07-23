<?php

namespace App\Actions\Progress;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MarkCourseItemAsCompletedAction
{
    public function execute(Course $course, int $courseModuleItemId): void
    {
        Log::info('Progress markAsCompleted called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
        ]);

        $course->markItemAsCompleted(Auth::id(), $courseModuleItemId);

        Log::info('Progress markAsCompleted completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
        ]);
    }
}
