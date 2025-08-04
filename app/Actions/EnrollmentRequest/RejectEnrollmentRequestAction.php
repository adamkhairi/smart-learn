<?php

namespace App\Actions\EnrollmentRequest;

use App\Models\EnrollmentRequest;
use App\Actions\Notification\CreateNotificationAction;

class RejectEnrollmentRequestAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

    public function execute(EnrollmentRequest $enrollmentRequest): bool
    {
        if ($enrollmentRequest->status !== 'pending') {
            return false; // Or throw an exception
        }

        $updated = $enrollmentRequest->update(['status' => 'rejected']);
        
        // Send notification to user about enrollment rejection
        if ($updated) {
            $user = \App\Models\User::find($enrollmentRequest->user_id);
            if ($user) {
                // Send real-time notification for enrollment rejection
                $this->createNotificationAction->executeWithBroadcast(
                    user: $user,
                    title: 'Enrollment Rejected',
                    message: "Your enrollment request for \"{$enrollmentRequest->course->name}\" has been rejected.",
                    type: 'error',
                    data: [
                        'course_title' => $enrollmentRequest->course->name,
                        'enrollment_status' => 'rejected',
                    ],
                    actionUrl: "/courses/{$enrollmentRequest->course->id}/public"
                );
            }
        }

        return $updated;
    }
}
