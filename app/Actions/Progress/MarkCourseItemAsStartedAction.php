<?php

namespace App\Actions\Progress;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MarkCourseItemAsStartedAction
{
    public function execute(Course $course, int $courseModuleItemId): void
    {
        Log::info('Progress markAsStarted called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
        ]);

        $course->markItemAsStarted(Auth::id(), $courseModuleItemId);

        Log::info('Progress markAsStarted completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
        ]);
    }
}
