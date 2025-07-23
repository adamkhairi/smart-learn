<?php

namespace App\Actions\EnrollmentRequest;

use App\Models\EnrollmentRequest;
use Illuminate\Support\Facades\DB;

class ApproveEnrollmentRequestAction
{
    public function execute(EnrollmentRequest $enrollmentRequest): bool
    {
        if ($enrollmentRequest->status !== 'pending') {
            return false; // Or throw an exception
        }

        DB::transaction(function () use ($enrollmentRequest) {
            $enrollmentRequest->update(['status' => 'approved']);
            $enrollmentRequest->course->enroll($enrollmentRequest->user_id, 'student');
        });

        return true;
    }
}
