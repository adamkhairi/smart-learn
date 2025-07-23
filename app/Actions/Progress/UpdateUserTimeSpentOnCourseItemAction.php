<?php

namespace App\Actions\Progress;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UpdateUserTimeSpentOnCourseItemAction
{
    public function execute(Course $course, int $courseModuleItemId, int $timeSpentSeconds): void
    {
        Log::info('Progress updateTimeSpent called', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
            'seconds' => $timeSpentSeconds,
        ]);

        $course->updateUserTimeSpent(Auth::id(), $courseModuleItemId, $timeSpentSeconds);

        Log::info('Progress updateTimeSpent completed', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'item_id' => $courseModuleItemId,
            'seconds' => $timeSpentSeconds,
        ]);
    }
}
