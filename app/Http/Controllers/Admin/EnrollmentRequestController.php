<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnrollmentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use App\Actions\EnrollmentRequest\ListEnrollmentRequestsAction;
use App\Actions\EnrollmentRequest\ApproveEnrollmentRequestAction;
use App\Actions\EnrollmentRequest\RejectEnrollmentRequestAction;

class EnrollmentRequestController extends Controller
{
    public function index(Request $request, ListEnrollmentRequestsAction $listEnrollmentRequestsAction): Response
    {
        try {
            $requests = $listEnrollmentRequestsAction->execute($request);

            return Inertia::render('Admin/EnrollmentRequests/Index', [
                'enrollmentRequests' => $requests,
                'filters' => $request->only('status'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching enrollment requests: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to load enrollment requests.');
        }
    }

    public function approve(EnrollmentRequest $enrollmentRequest, ApproveEnrollmentRequestAction $approveEnrollmentRequestAction)
    {
        try {
            if (!$approveEnrollmentRequestAction->execute($enrollmentRequest)) {
                return Redirect::back()->with('error', 'Only pending requests can be approved.');
            }
            return Redirect::back()->with('success', 'Enrollment request approved and user enrolled successfully.');
        } catch (\Exception $e) {
            Log::error('Error approving enrollment request: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to approve enrollment request.');
        }
    }

    public function reject(EnrollmentRequest $enrollmentRequest, RejectEnrollmentRequestAction $rejectEnrollmentRequestAction)
    {
        try {
            if (!$rejectEnrollmentRequestAction->execute($enrollmentRequest)) {
                return Redirect::back()->with('error', 'Only pending requests can be rejected.');
            }
            return Redirect::back()->with('success', 'Enrollment request rejected.');
        } catch (\Exception $e) {
            Log::error('Error rejecting enrollment request: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to reject enrollment request.');
        }
    }
}
