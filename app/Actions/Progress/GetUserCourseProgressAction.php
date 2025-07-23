<?php

namespace App\Actions\Progress;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;

class GetUserCourseProgressAction
{
    public function execute(Course $course): array
    {
        $user = Auth::user();
        $progress = $course->getUserProgress($user->id);
        $progressRecords = $course->getUserProgressRecords($user->id);

        return [
            'course' => $course->load(['modules.moduleItems']),
            'progress' => $progress,
            'progressRecords' => $progressRecords,
        ];
    }
}
