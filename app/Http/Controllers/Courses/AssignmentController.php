<?php

namespace App\Http\Controllers\Courses;

use App\Actions\Assignment\GradeSubmissionAction;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Submission;
use App\Actions\Assignment\SubmitAssignmentAction;
use App\Actions\Assignment\ListAssignmentSubmissionsAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

        // Get submission count for instructors
        $submissionCount = Submission::where([
            'course_id' => $course->id,
            'assignment_id' => $assignment->id,
        ])->count();

        return Inertia::render('Assignments/Show', [
            'course' => $course,
            'assignment' => $assignment,
            'userSubmission' => $userSubmission,
            'submissionCount' => $submissionCount,
        ]);
    }

    /**
     * Show assignment submission form.
     */
    public function showSubmissionForm(Course $course, Assignment $assignment): Response|RedirectResponse
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
        Log::info('Assignment submission attempt', [
            'course_id' => $course->id,
            'assignment_id' => $assignment->id,
            'user_id' => Auth::id(),
            'has_files' => $request->hasFile('files'),
            'request_files' => $request->allFiles(),
            'request_all' => $request->all(),
        ]);

        // Check if file was uploaded but rejected by PHP due to size limits
        if ($request->hasFile('file') && !$request->file('file')->isValid()) {
            return back()->withErrors([
                'file' => 'File upload failed. Please ensure your file is smaller than 10MB.'
            ]);
        }

        $validated = $request->validate([
            'submission_text' => 'nullable|string|max:50000',
            'file' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,zip,rar,jpg,jpeg,png', // 10MB limit to match backend
        ]);

        try {
            $submissionData = [
                'submission_text' => $validated['submission_text'] ?? null,
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                $submissionData['file'] = $request->file('file');
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
    public function downloadSubmission(Course $course, Assignment $assignment, Submission $submission, string $filename): BinaryFileResponse
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

        $fullPath = Storage::disk('private')->path($filePath);

        return response()->download($fullPath, $submission->original_filename);
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
    public function gradeSubmission(Request $request, Course $course, Assignment $assignment, Submission $submission, GradeSubmissionAction $gradeSubmissionAction)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:' . $assignment->total_points,
            'feedback' => 'nullable|string|max:5000',
            'grading_notes' => 'nullable|string|max:2000',
        ]);

        try {
            $gradeSubmissionAction->execute($submission, $assignment, $request->only(['score', 'feedback', 'grading_notes']));
            return back()->with('success', 'Grade submitted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * List all submissions for a selected course (for instructors/admins).
     */
    public function allSubmissions(Request $request): Response
    {
        $user = Auth::user();

        // Get courses where user is instructor or admin
        $availableCourses = Course::where('created_by', $user->id)
        ->orWhereHas('enrolledUsers', function ($query) use ($user) {
            $query->where('user_id', $user->id)
              ->whereIn('enrolled_as', ['instructor', 'admin']);
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $courseIds = $availableCourses->pluck('id');

        // Get selected course ID (empty string means all courses)
        $selectedCourseId = $request->get('course_id', '');

        // Validate selected course is accessible to user (if a specific course is selected)
        if ($selectedCourseId && !$courseIds->contains($selectedCourseId)) {
            abort(403, 'Unauthorized access to course submissions.');
        }

        // Build query for submissions
        $query = Submission::with([
            'user:id,name,email',
            'assignment:id,title,total_points,expired_at,assignment_type',
            'assignment.moduleItem:id,course_module_id,title,itemable_id,itemable_type',
            'assignment.moduleItem.courseModule:id,title,course_id',
            'course:id,name'
        ])
        ->whereNotNull('assignment_id'); // Only assignment submissions

        // Filter by course if a specific course is selected
        if ($selectedCourseId) {
            $query->where('course_id', $selectedCourseId);
        } else {
            // Show submissions from all accessible courses
            // If no accessible courses, ensure empty result set
            if ($courseIds->isEmpty()) {
                $query->whereNull('id');
            } else {
                $query->whereIn('course_id', $courseIds);
            }
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'graded':
                    $query->whereNotNull('score');
                    break;
                case 'ungraded':
                    $query->whereNull('score');
                    break;
                case 'late':
                    $query->whereHas('assignment', function ($q) {
                        $q->whereRaw('submissions.created_at > assignments.due_date');
                    });
                    break;
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('assignment', function ($assignmentQuery) use ($search) {
                    $assignmentQuery->where('title', 'like', "%{$search}%");
                })
                ->orWhereHas('course', function ($courseQuery) use ($search) {
                    $courseQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        $submissions = $query->orderBy('created_at', 'desc')
                           ->paginate(20)
                           ->withQueryString();

        // Get statistics - for selected course or all accessible courses
        $statsQuery = Submission::whereNotNull('assignment_id');
        if ($selectedCourseId) {
            $statsQuery->where('course_id', $selectedCourseId);
        } else {
            $statsQuery->whereIn('course_id', $courseIds);
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'graded' => (clone $statsQuery)->whereNotNull('score')->count(),
            'ungraded' => (clone $statsQuery)->whereNull('score')->count(),
            'late' => (clone $statsQuery)->whereHas('assignment', function ($q) {
                $q->whereRaw('submissions.created_at > assignments.expired_at');
            })->count(),
        ];

        // Get selected course details (null if showing all courses)
        $selectedCourse = $selectedCourseId ? $availableCourses->firstWhere('id', $selectedCourseId) : null;

        return Inertia::render('Submissions/Index', [
            'submissions' => $submissions,
            'courses' => $availableCourses,
            'selectedCourse' => $selectedCourse,
            'stats' => $stats,
            'filters' => $request->only(['course_id', 'status', 'search']),
        ]);
    }
}
