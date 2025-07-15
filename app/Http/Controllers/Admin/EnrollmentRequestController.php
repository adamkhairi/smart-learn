<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class EnrollmentRequestController extends Controller
{
    /**
     * Display a listing of enrollment requests.
     */
    public function index(Request $request): Response
    {
        $query = EnrollmentRequest::with(['user:id,name,email', 'course:id,name']);

        // Apply status filter
        if ($status = $request->query('status')) {
            if (in_array($status, ['pending', 'approved', 'rejected'])) {
                $query->where('status', $status);
            }
        }

        $requests = $query->latest()->paginate(10);

        return Inertia::render('Admin/EnrollmentRequests/Index', [
            'enrollmentRequests' => $requests,
            'filters' => $request->only('status'),
        ]);
    }

    /**
     * Approve an enrollment request.
     */
    public function approve(EnrollmentRequest $enrollmentRequest)
    {
        // Only pending requests can be approved
        if ($enrollmentRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        DB::transaction(function () use ($enrollmentRequest) {
            // Update request status
            $enrollmentRequest->update(['status' => 'approved']);

            // Enroll the user in the course
            $enrollmentRequest->course->enroll($enrollmentRequest->user_id, 'student');
        });

        return back()->with('success', 'Enrollment request approved and user enrolled successfully.');
    }

    /**
     * Reject an enrollment request.
     */
    public function reject(EnrollmentRequest $enrollmentRequest)
    {
        // Only pending requests can be rejected
        if ($enrollmentRequest->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $enrollmentRequest->update(['status' => 'rejected']);

        return back()->with('success', 'Enrollment request rejected.');
    }
}
