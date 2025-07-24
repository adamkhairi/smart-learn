<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\EnrollmentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EnrollmentRequestAction
{
    public function execute(Request $request, Course $course): array
    {
        $user = Auth::user();

        // Ensure user is authenticated
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Authentication required.',
                'status' => 401
            ];
        }

        // Check if the user is already enrolled in the course
        if ($course->enrolledUsers->contains($user->id)) {
            return [
                'success' => false,
                'message' => 'You are already enrolled in this course.',
                'status' => 400
            ];
        }

        // Check if a pending request already exists for this user and course
        $existingRequest = EnrollmentRequest::where('user_id', $user->id)
                                            ->where('course_id', $course->id)
                                            ->where('status', 'pending')
                                            ->first();

        if ($existingRequest) {
            return [
                'success' => false,
                'message' => 'You already have a pending enrollment request for this course.',
                'status' => 400
            ];
        }

        // Validate request data (e.g., for an optional message from the user)
        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        try {
            EnrollmentRequest::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'pending',
                'message' => $validated['message'] ?? null,
            ]);

            // Optionally, notify admin/instructor about the new request
            // Notification::send(User::where('role', 'admin')->get(), new NewEnrollmentRequest($request));

            return [
                'success' => true,
                'message' => 'Enrollment request sent successfully! You will be notified once it\'s reviewed.',
                'status' => 200
            ];
        } catch (\Exception $e) {
            Log::error('Error sending enrollment request:', ['error' => $e->getMessage(), 'user_id' => $user->id, 'course_id' => $course->id]);

            return [
                'success' => false,
                'message' => 'Failed to send enrollment request. Please try again.',
                'status' => 500
            ];
        }
    }
}
