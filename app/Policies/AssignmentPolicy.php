<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssignmentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the submissions for the assignment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Assignment  $assignment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewSubmissions(User $user, Assignment $assignment)
    {
        return $user->id === $assignment->course->created_by;
    }

    /**
     * Determine whether the user can grade the submissions for the assignment.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Assignment  $assignment
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function grade(User $user, Assignment $assignment)
    {
        return $user->id === $assignment->course->created_by;
    }
}
