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
                $this->createNotificationAction->createEnrollmentNotification(
                    user: $user,
                    courseTitle: $enrollmentRequest->course->name,
                    status: 'rejected',
                    actionUrl: "/courses/{$enrollmentRequest->course->id}/public"
                );
            }
        }

        return $updated;
    }
}
