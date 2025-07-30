<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Submission;
use App\Actions\Assignment\SubmitAssignmentAction;
use App\Actions\Assignment\ListAssignmentSubmissionsAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    /**
     * Display the specified assignment.
     */
    public function show(Course $course, Assignment $assignment): Response
    {
        $this->authorize('view', $course);

        $assignment->load(['creator', 'course']);

        $userSubmission = null;
        if (Auth::check()) {
            $userSubmission = Submission::where([
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'assignment_id' => $assignment->id,
            ])->first();
        }

        return Inertia::render('Assignments/Show', [
            'course' => $course,
            'assignment' => $assignment,
            'userSubmission' => $userSubmission,
        ]);
    }

    /**
     * Show assignment submission form.
     */
    public function showSubmissionForm(Course $course, Assignment $assignment): Response
    {
        $this->authorize('view', $course);

        // Check if assignment accepts submissions
        if (!$assignment->canAcceptSubmissions()) {
            // Find the module item that contains this assignment
            $moduleItem = \App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assignment')
                ->where('itemable_id', $assignment->id)
                ->first();

            if ($moduleItem) {
                return redirect()->route('courses.modules.items.show', [
                    'course' => $course,
                    'module' => $moduleItem->courseModule,
                    'item' => $moduleItem,
                ])->with('error', 'This assignment is not accepting submissions.');
            } else {
                // Fallback to course page if module item not found
                return redirect()->route('courses.show', $course)
                    ->with('error', 'This assignment is not accepting submissions.');
            }
        }

        $existingSubmission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assignment_id' => $assignment->id,
        ])->first();

        return Inertia::render('Assignments/Submit', [
            'course' => $course,
            'assignment' => $assignment,
            'existingSubmission' => $existingSubmission,
        ]);
    }

    /**
     * Submit assignment.
     */
    public function submit(Request $request, Course $course, Assignment $assignment, SubmitAssignmentAction $submitAction)
    {
        $this->authorize('view', $course);

        // Debug: Log incoming request data
        \Log::info('Assignment submission attempt', [
            'course_id' => $course->id,
            'assignment_id' => $assignment->id,
            'user_id' => auth()->id(),
            'has_files' => $request->hasFile('files'),
            'request_files' => $request->allFiles(),
            'request_all' => $request->all(),
        ]);

        // Check if file was uploaded but rejected by PHP due to size limits
        if ($request->hasFile('files') && !$request->file('files')->isValid()) {
            return back()->withErrors([
                'files' => 'File upload failed. Please ensure your file is smaller than 3MB.'
            ]);
        }

        $validated = $request->validate([
            'submission_text' => 'nullable|string|max:50000',
            'files' => 'nullable|file|max:3072|mimes:pdf,doc,docx,txt,zip,rar,jpg,jpeg,png', // Temporarily increased to 3072 (3MB) for testing
        ]);

        try {
            $submissionData = [
                'submission_text' => $validated['submission_text'] ?? null,
            ];

            // Handle file upload
            if ($request->hasFile('files')) {
                $submissionData['file'] = $request->file('files');
            }

            $result = $submitAction->execute($assignment, $course, $submissionData);

            // Find the module item that contains this assignment
            $moduleItem = \App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assignment')
                ->where('itemable_id', $assignment->id)
                ->first();

            if ($moduleItem) {
                return redirect()->route('courses.modules.items.show', [
                    'course' => $course,
                    'module' => $moduleItem->courseModule,
                    'item' => $moduleItem,
                ])->with('success', $result['message']);
            } else {
                // Fallback to course page if module item not found
                return redirect()->route('courses.show', $course)
                    ->with('success', $result['message']);
            }
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Download submission file.
     */
    public function downloadSubmission(Course $course, Assignment $assignment, Submission $submission, string $filename)
    {
        $this->authorize('view', $course);

        // Check if user owns the submission or is an instructor
        if ($submission->user_id !== Auth::id() && !Auth::user()->can('update', $course)) {
            abort(403, 'Unauthorized access to submission.');
        }

        $filePath = $submission->file_path;
        if (!$filePath || !Storage::disk('private')->exists($filePath)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('private')->download($filePath, $submission->original_filename);
    }

    /**
     * List assignment submissions (for instructors).
     */
    public function submissions(Course $course, Assignment $assignment, ListAssignmentSubmissionsAction $listAction): Response
    {
        $this->authorize('update', $course);

        $submissions = $listAction->execute($assignment);

        return Inertia::render('Assignments/Submissions', [
            'course' => $course,
            'assignment' => $assignment,
            'submissions' => $submissions,
        ]);
    }

    /**
     * Grade a submission.
     */
    public function gradeSubmission(Request $request, Course $course, Assignment $assignment, Submission $submission)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string|max:5000',
            'grading_notes' => 'nullable|string|max:2000',
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
