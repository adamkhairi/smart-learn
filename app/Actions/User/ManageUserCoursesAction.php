<?php

namespace App\Actions\User;

use App\Models\User;
use App\Models\Course;

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
            throw new \Exception("User is already enrolled in this course.");
        }

        $user->enrollments()->attach($courseId, [
            'enrolled_as' => $role,
        ]);
    }

    /**
     * Remove user from a course.
     */
    public function removeFromCourse(User $user, int $courseId): void
    {
        // Check if user is enrolled
        if (!$user->enrollments()->where('course_id', $courseId)->exists()) {
            throw new \Exception("User is not enrolled in this course.");
        }

        $user->enrollments()->detach($courseId);
    }

    /**
     * Update user's role in a course.
     */
    public function updateCourseRole(User $user, int $courseId, string $role): void
    {
        // Check if user is enrolled
        if (!$user->enrollments()->where('course_id', $courseId)->exists()) {
            throw new \Exception("User is not enrolled in this course.");
        }

        $user->enrollments()->updateExistingPivot($courseId, [
            'enrolled_as' => $role
        ]);
    }
}
