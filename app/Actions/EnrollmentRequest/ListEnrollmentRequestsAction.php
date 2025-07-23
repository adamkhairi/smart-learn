<?php

namespace App\Actions\EnrollmentRequest;

use App\Models\EnrollmentRequest;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ListEnrollmentRequestsAction
{
    public function execute(Request $request): LengthAwarePaginator
    {
        $query = EnrollmentRequest::with(['user:id,name,email', 'course:id,name']);

        if ($status = $request->query('status')) {
            if (in_array($status, ['pending', 'approved', 'rejected'])) {
                $query->where('status', $status);
            }
        }

        return $query->latest()->paginate(10);
    }
}
