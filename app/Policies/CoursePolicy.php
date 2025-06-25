<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can view any courses.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view courses list
    }

    /**
     * Determine whether the user can view the course.
     */
    public function view(User $user, Course $course): bool
    {
        // Admin can view all courses
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can view their own course
        if ($course->created_by === $user->id) {
            return true;
        }

        // Enrolled users can view the course
        return $course->enrolledUsers()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create courses.
     */
    public function create(User $user): bool
    {
        // Only instructors and admins can create courses
        return $user->isInstructor() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the course.
     */
    public function update(User $user, Course $course): bool
    {
        // Admin can update any course
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can update their own course
        return $course->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the course.
     */
    public function delete(User $user, Course $course): bool
    {
        // Admin can delete any course
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can delete their own course
        return $course->created_by === $user->id;
    }

    /**
     * Determine whether the user can enroll users in the course.
     */
    public function enroll(User $user, Course $course): bool
    {
        // Admin can enroll users in any course
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can enroll users in their own course
        return $course->created_by === $user->id;
    }

    /**
     * Determine whether the user can unenroll users from the course.
     */
    public function unenroll(User $user, Course $course): bool
    {
        // Admin can unenroll users from any course
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can unenroll users from their own course
        return $course->created_by === $user->id;
    }

    /**
     * Determine whether the user can view course statistics.
     */
    public function viewStats(User $user, Course $course): bool
    {
        // Admin can view stats for any course
        if ($user->isAdmin()) {
            return true;
        }

        // Creator can view stats for their own course
        return $course->created_by === $user->id;
    }
}
