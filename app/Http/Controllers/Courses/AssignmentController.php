<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Actions\Assignment\SubmitAssignmentAction;
use App\Actions\Assignment\ListAssignmentSubmissionsAction;
use App\Actions\Assignment\GradeSubmissionAction;

class AssignmentController extends Controller
{
    public function submit(Request $request, Assignment $assignment, SubmitAssignmentAction $submitAssignmentAction)
    {
        try {
            $submitAssignmentAction->execute($assignment, $request->file('submission_file'));
            return redirect()->back()->with('success', 'Assignment submitted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function submissions(Assignment $assignment, ListAssignmentSubmissionsAction $listAssignmentSubmissionsAction)
    {
        $this->authorize('viewSubmissions', $assignment);

        $submissions = $listAssignmentSubmissionsAction->execute($assignment);

        return Inertia::render('Assignments/Submissions', [
            'assignment' => $assignment,
            'submissions' => $submissions,
        ]);
    }

    public function grade(Request $request, Submission $submission, GradeSubmissionAction $gradeSubmissionAction)
    {
        $this->authorize('grade', $submission->assignment);

        $request->validate([
            'score' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        try {
            $gradeSubmissionAction->execute($submission, $request->only(['score', 'feedback']));
            return back()->with('success', 'Grade submitted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
