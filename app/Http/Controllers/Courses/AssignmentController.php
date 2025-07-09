<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function submit(Request $request, Assignment $assignment)
    {
        // Check if assignment can accept submissions
        if (!$assignment->canAcceptSubmissions()) {
            return back()->with('error', 'This assignment is not accepting submissions.');
        }

        // Check if user already submitted
        $existingSubmission = $assignment->submissions()
            ->where('user_id', Auth::id())
            ->first();

        if ($existingSubmission) {
            return back()->with('error', 'You have already submitted this assignment.');
        }

        $request->validate([
            'submission_file' => 'required|file|mimes:pdf,doc,docx,zip,txt,jpg,jpeg,png|max:10240',
        ]);

        $path = $request->file('submission_file')->store('submissions', 'public');

        // Use database transaction to prevent race conditions
        DB::transaction(function () use ($assignment, $path) {
            // Double-check assignment status within transaction
            if (!$assignment->canAcceptSubmissions()) {
                throw new \Exception('Assignment submission deadline has passed.');
            }

            Submission::create([
                'assignment_id' => $assignment->id,
                'course_id' => $assignment->course_id,
                'user_id' => Auth::id(),
                'files' => [$path],
                'submitted_at' => now(),
                'auto_grading_status' => 'unGraded',
                'plagiarism_status' => 'unCalculated',
            ]);
        });

        return redirect()->back()->with('success', 'Assignment submitted successfully!');
    }

    public function submissions(Assignment $assignment)
    {
        $this->authorize('viewSubmissions', $assignment);

        $submissions = $assignment->submissions()->with(['user', 'grade'])->get();

        return Inertia::render('Assignments/Submissions', [
            'assignment' => $assignment,
            'submissions' => $submissions,
        ]);
    }

    public function grade(Request $request, Submission $submission)
    {
        $this->authorize('grade', $submission->assignment);

        $request->validate([
            'score' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        // Update submission directly instead of creating separate grade record
        $submission->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
            'graded_at' => now(),
            'graded_by' => Auth::id(),
            'auto_grading_status' => 'Graded',
        ]);

        return back()->with('success', 'Grade submitted successfully!');
    }
}
