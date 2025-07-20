<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\Discussion;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DiscussionPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     *
     * @param \App\Models\User $user
     * @return bool|void
     */
    public function before(User $user)
    {
        if ($user->isAdmin()) {
            return true;
        }
    }

    /**
     * Determine whether the user can view any discussions for a given course.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Course $course
     * @return bool
     */
    public function viewAny(User $user, Course $course): bool
    {
        // A user can view discussions if they are the course instructor or are enrolled in the course.
        return $user->id === $course->user_id || $user->isEnrolled($course);
    }

    /**
     * Determine whether the user can view the discussion.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Discussion $discussion
     * @return bool
     */
    public function view(User $user, Discussion $discussion): bool
    {
        // A user can view a specific discussion if they have access to the course it belongs to.
        return $this->viewAny($user, $discussion->course);
    }

    /**
     * Determine whether the user can create discussions for a given course.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Course $course
     * @return bool
     */
    public function create(User $user, Course $course): bool
    {
        // A user can create a discussion if they are the instructor or are enrolled.
        return $user->id === $course->user_id || $user->isEnrolled($course);
    }

    /**
     * Determine whether the user can update the discussion.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Discussion $discussion
     * @return bool
     */
    public function update(User $user, Discussion $discussion): bool
    {
        // Only the user who created the discussion or the course instructor can update it.
        return $user->id === $discussion->user_id || $user->id === $discussion->course->user_id;
    }

    /**
     * Determine whether the user can delete the discussion.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Discussion $discussion
     * @return bool
     */
    public function delete(User $user, Discussion $discussion): bool
    {
        // Only the user who created the discussion or the course instructor can delete it.
        return $user->id === $discussion->user_id || $user->id === $discussion->course->user_id;
    }

    /**
     * Determine whether the user can restore the discussion.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Discussion $discussion
     * @return bool
     */
    public function restore(User $user, Discussion $discussion): bool
    {
        // Only the course instructor can restore a discussion.
        return $user->id === $discussion->course->user_id;
    }

    /**
     * Determine whether the user can permanently delete the discussion.
     *
     * @param \App\Models\User $user
     * @param \App\Models\Discussion $discussion
     * @return bool
     */
    public function forceDelete(User $user, Discussion $discussion): bool
    {
        // Only the course instructor can permanently delete a discussion.
        return $user->id === $discussion->course->user_id;
    }
}
