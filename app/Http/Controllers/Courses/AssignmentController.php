<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function submit(Request $request, Assignment $assignment)
    {
        $request->validate([
            'submission_file' => 'required|file|mimes:pdf,doc,docx,zip,txt,jpg,jpeg,png|max:10240',
        ]);

        $path = $request->file('submission_file')->store('submissions', 'public');

        Submission::create([
            'assignment_id' => $assignment->id,
            'course_id' => $assignment->course_id,
            'user_id' => Auth::id(),
            'files' => [$path], // Store as array as expected by model
            'submitted_at' => now(),
            'auto_grading_status' => 'unGraded',
            'plagiarism_status' => 'unCalculated',
        ]);

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
