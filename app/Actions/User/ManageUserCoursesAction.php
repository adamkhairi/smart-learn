<?php
declare(strict_types=1);

namespace App\Actions\User;

use App\Models\User;
use App\Models\Course;
use Illuminate\Support\Facades\Log;

class ManageUserCoursesAction
{
    /**
     * Assign user to a course with specified role.
     */
    public function assignToCourse(User $user, int $courseId, string $role): void
    {
        $course = Course::findOrFail($courseId);

        // Check if user is already enrolled
        if ($user->enrollments()->where('course_id', $courseId)->exists()) {
            Log::warning('Attempt to enroll user already enrolled', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);
            throw new \RuntimeException('User is already enrolled in this course.');
        }

        try {
            $user->enrollments()->attach($courseId, [
                'enrolled_as' => $role,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to assign user to course', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Remove user from a course.
     */
    public function removeFromCourse(User $user, int $courseId): void
    {
        // Check if user is enrolled
        if (!$user->enrollments()->where('course_id', $courseId)->exists()) {
            Log::warning('Attempt to remove user not enrolled', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);
            throw new \RuntimeException('User is not enrolled in this course.');
        }

        try {
            $user->enrollments()->detach($courseId);
        } catch (\Throwable $e) {
            Log::error('Failed to remove user from course', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Update user's role in a course.
     */
    public function updateCourseRole(User $user, int $courseId, string $role): void
    {
        // Check if user is enrolled
        if (!$user->enrollments()->where('course_id', $courseId)->exists()) {
            Log::warning('Attempt to update role for user not enrolled', [
                'user_id' => $user->id,
                'course_id' => $courseId,
            ]);
            throw new \RuntimeException('User is not enrolled in this course.');
        }

        try {
            $user->enrollments()->updateExistingPivot($courseId, [
                'enrolled_as' => $role,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update user course role', [
                'user_id' => $user->id,
                'course_id' => $courseId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
