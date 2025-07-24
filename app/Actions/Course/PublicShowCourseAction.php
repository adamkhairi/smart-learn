<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\EnrollmentRequest;
use Illuminate\Support\Facades\Auth;

class PublicShowCourseAction
{
    public function execute(Course $course): array
    {
        $user = Auth::user();

        // Check if the course is private or not published
        if ($course->is_private || $course->status !== 'published') {
            // For guests or users without access, this will be handled in the controller
            // by redirecting or showing an error
        }

        // Determine if current user is enrolled, creator, or admin to pass this info to frontend
        $isUserEnrolled = false;
        $isCourseCreator = false;
        $isUserAdmin = false;

        if ($user) {
            $isUserEnrolled = $course->enrolledUsers()->where('user_id', $user->id)->exists();
            $isCourseCreator = ($course->created_by === $user->id);
            $isUserAdmin = $user->isAdmin();
        }

        // Check for pending enrollment request only if not already enrolled
        $hasPendingEnrollmentRequest = false;
        if ($user && !$isUserEnrolled) {
            $hasPendingEnrollmentRequest = EnrollmentRequest::where('user_id', $user->id)
                                            ->where('course_id', $course->id)
                                            ->where('status', 'pending')
                                            ->exists();
        }

        // Load minimal details for public view
        $course->load(['creator:id,name,email,photo', 'category:id,name,slug']);

        return [
            'course' => $course,
            'hasPendingEnrollmentRequest' => $hasPendingEnrollmentRequest,
            'canAccessFullCourse' => $isUserEnrolled || $isCourseCreator || $isUserAdmin, // Flag for frontend redirection
        ];
    }
}
