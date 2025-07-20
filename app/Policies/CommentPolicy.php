<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CommentPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     *
     * @param  \App\Models\User  $user
     * @return bool|void
     */
    public function before(User $user)
    {
        // Grant all permissions to admin users.
        if ($user->isAdmin()) {
            return true;
        }
    }

    /**
     * Determine whether the user can view any comments.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        // Authorization to view comments is primarily handled by the parent resource's policy
        // (e.g., a user can see comments if they can see the discussion).
        // This policy assumes the parent has already been checked.
        return true;
    }

    /**
     * Determine whether the user can view the comment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function view(User $user, Comment $comment): bool
    {
        // Similar to viewAny, this is delegated to the parent resource's policy.
        return true;
    }

    /**
     * Determine whether the user can create comments.
     * The parent model (e.g., Discussion) must be passed for contextual authorization.
     *
     * @param  \App\Models\User  $user
     * @param  mixed  $commentable
     * @return bool
     */
    public function create(User $user, $commentable): bool
    {
        // Check if the commentable resource belongs to a course.
        if (method_exists($commentable, 'course')) {
            $course = $commentable->course;
            // Allow if the user is enrolled in the course or is the course instructor.
            return $user->isEnrolled($course) || $user->id === $course->user_id;
        }

        // Default to false if the commentable type is not supported or has no course.
        return false;
    }

    /**
     * Determine whether the user can update the comment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function update(User $user, Comment $comment): bool
    {
        // Only the user who created the comment can update it.
        return $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can delete the comment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function delete(User $user, Comment $comment): bool
    {
        $commentable = $comment->commentable;

        // Check if the commentable resource belongs to a course.
        if (method_exists($commentable, 'course')) {
            $course = $commentable->course;
            // Allow if the user is the comment owner or the course instructor.
            return $user->id === $comment->user_id || $user->id === $course->user_id;
        }

        // For comments not related to a course, only the owner can delete.
        return $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can restore the comment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function restore(User $user, Comment $comment): bool
    {
        // Only the comment owner can restore it.
        return $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can permanently delete the comment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Comment  $comment
     * @return bool
     */
    public function forceDelete(User $user, Comment $comment): bool
    {
        // Only the comment owner can permanently delete it.
        return $user->id === $comment->user_id;
    }
}
