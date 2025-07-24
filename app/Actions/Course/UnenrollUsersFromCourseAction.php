<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\Request;

class UnenrollUsersFromCourseAction
{
    public function execute(Request $request, Course $course): int
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $unenrolledCount = 0;
        foreach ($validated['user_ids'] as $userId) {
            try {
                $course->unenroll($userId);
                $unenrolledCount++;
            } catch (\Exception $e) {
                // User might not be enrolled, continue
            }
        }

        return $unenrolledCount;
    }
}
