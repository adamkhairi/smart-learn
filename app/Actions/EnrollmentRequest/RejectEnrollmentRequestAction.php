<?php

namespace App\Actions\EnrollmentRequest;

use App\Models\EnrollmentRequest;

class RejectEnrollmentRequestAction
{
    public function execute(EnrollmentRequest $enrollmentRequest): bool
    {
        if ($enrollmentRequest->status !== 'pending') {
            return false; // Or throw an exception
        }

        return $enrollmentRequest->update(['status' => 'rejected']);
    }
}
