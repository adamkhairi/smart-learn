<?php

namespace App\Actions\EnrollmentRequest;

use App\Models\EnrollmentRequest;
use App\Actions\Notification\CreateNotificationAction;
use Illuminate\Support\Facades\DB;

class ApproveEnrollmentRequestAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

    public function execute(EnrollmentRequest $enrollmentRequest): bool
    {
        if ($enrollmentRequest->status !== 'pending') {
            return false; // Or throw an exception
        }

        DB::transaction(function () use ($enrollmentRequest) {
            $enrollmentRequest->update(['status' => 'approved']);
            $enrollmentRequest->course->enroll($enrollmentRequest->user_id, 'student');
            
            // Send notification to user about enrollment approval
            $user = \App\Models\User::find($enrollmentRequest->user_id);
            if ($user) {
                // Send real-time notification for enrollment approval
                $this->createNotificationAction->executeWithBroadcast(
                    user: $user,
                    title: 'Enrollment Approved',
                    message: "Your enrollment request for \"{$enrollmentRequest->course->name}\" has been approved. You can now access the course content.",
                    type: 'success',
                    data: [
                        'course_title' => $enrollmentRequest->course->name,
                        'enrollment_status' => 'approved',
                    ],
                    actionUrl: "/courses/{$enrollmentRequest->course->id}"
                );
            }
        });

        return true;
    }
}
