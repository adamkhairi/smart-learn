<?php

namespace App\Actions\Progress;

use Illuminate\Support\Facades\Auth;

class GetOverallUserProgressAction
{
    public function execute(): array
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

        return [
            'courses' => $enrolledCourses,
            'overallProgress' => $overallProgress,
        ];
    }
}
