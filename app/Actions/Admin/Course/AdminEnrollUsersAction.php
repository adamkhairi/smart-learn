<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use Illuminate\Http\Request;

class AdminEnrollUsersAction
{
    public function execute(Request $request, Course $course): int
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role' => 'required|in:student,instructor',
        ]);

        $enrolledCount = 0;
        foreach ($validated['user_ids'] as $userId) {
            try {
                $course->enroll($userId, $validated['role']);
                $enrolledCount++;
            } catch (\Exception $e) {
                // User might already be enrolled, continue
            }
        }

        return $enrolledCount;
    }
}
