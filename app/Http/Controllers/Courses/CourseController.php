<?php

namespace App\Http\Controllers\Courses;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use App\Enums\CourseLevel;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $courses = [];

                if (!$user) {
            // Guest users see only published courses
            $courses = Course::with(['creator', 'enrolledUsers'])
                ->where('status', 'published')
                ->latest()
                ->get();
        } elseif ($user->isAdmin()) {
            // Admin sees all courses
            $courses = Course::with(['creator', 'enrolledUsers'])
                ->latest()
                ->get();
        } elseif ($user->isInstructor()) {
            // Instructor sees courses they created and are enrolled in
            $courses = Course::with(['creator', 'enrolledUsers'])
                ->where('created_by', $user->id)
                ->orWhereHas('enrolledUsers', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->latest()
                ->get();
        } else {
            // Students see courses they're enrolled in
            $courses = Course::with(['creator', 'enrolledUsers'])
                ->whereHas('enrolledUsers', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('status', 'published')
                ->latest()
                ->get();
        }
        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'userRole' => $user?->role ?? 'guest',
        ]);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create(): Response
    {
        $this->authorize('create', Course::class);

        $categories = Category::all();

        return Inertia::render('Courses/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Course::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:published,archived',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        try {
            $course = new Course($validated);
            $course->created_by = Auth::id();

            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('courses/images', 'public');
                $course->image = $path;
            }

            $course->save();

            // Auto-enroll the creator as instructor
            $course->enroll(Auth::id(), 'instructor');

            return redirect()->route('courses.show', $course)
                ->with('success', 'Course created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create course. Please try again.');
        }
    }

    /**
     * Display the specified course.
     */
     public function show(Course $course): Response
    {
        $user = Auth::user();

        // Check if user has access to this course
        if (!$user->isAdmin() &&
            $course->created_by !== $user->id &&
            !$course->enrolledUsers()->where('user_id', $user->id)->exists()) {
            abort(403, 'You do not have access to this course.');
        }

        // Determine if user is instructor for this course
        $isInstructor = $user->isAdmin() || $course->created_by === $user->id;

        // Get user enrollment data
        $userEnrollmentData = $course->enrolledUsers()
            ->where('user_id', $user->id)
            ->first();

        // Format userEnrollment as expected by frontend
        $userEnrollment = null;
        if ($userEnrollmentData) {
            $userEnrollment = [
                'id' => $userEnrollmentData->pivot->id ?? null,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'enrolled_as' => $userEnrollmentData->pivot->enrolled_as,
                'created_at' => $userEnrollmentData->pivot->created_at,
                'updated_at' => $userEnrollmentData->pivot->updated_at,
                'completed_module_items' => $course->getCompletedModuleItemIds($user->id),
            ];
        }

        // Single optimized query with all necessary relationships
        $course = Course::with([
            'creator:id,name,email,photo',
            'enrolledUsers:id,name,email,photo',
            'modules' => function ($query) use ($isInstructor) {
                $query->when(!$isInstructor, function ($q) {
                    $q->where('is_published', true);
                })->ordered()->with(['moduleItems' => function ($q) {
                    $q->ordered();
                }]);
            },
            'assignments:id,title,course_id,expired_at,total_points,status',
            'assessments:id,title,course_id,expired_at,total_points,status',
            'announcements' => function ($query) {
                $query->select('id', 'title', 'course_id', 'created_at')
                    ->latest()
                    ->limit(5);
            },
            'discussions' => function ($query) {
                $query->select('id', 'title', 'course_id', 'created_at')
                    ->latest()
                    ->limit(5);
            }
        ])->find($course->id);

        return Inertia::render('Courses/Show', [
            'course' => $course,
            'userEnrollment' => $userEnrollment,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        $categories = Category::all();

        return Inertia::render('Courses/Edit', [
            'course' => $course,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:published,archived',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        try {
            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($course->image) {
                    Storage::disk('public')->delete($course->image);
                }

                $path = $request->file('image')->store('courses/images', 'public');
                $validated['image'] = $path;
            }

            $course->update($validated);

            return redirect()->route('courses.show', $course)
                ->with('success', 'Course updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to update course. Please try again.');
        }
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);

        try {
            // Delete course image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }

            $course->delete();

            return redirect()->route('courses.index')
                ->with('success', 'Course deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete course. Please try again.');
        }
    }

    /**
     * Enroll a user in the course.
     */
    public function enroll(Request $request, Course $course)
    {
        $this->authorize('enroll', $course);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:student,instructor,admin',
        ]);

        try {
            $course->enroll($validated['user_id'], $validated['role'], Auth::user());
            return back()->with('success', 'User enrolled successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Unenroll a user from the course.
     */
    public function unenroll(Request $request, Course $course)
    {
        $this->authorize('unenroll', $course);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $course->unenroll($validated['user_id']);

            return back()->with('success', 'User unenrolled successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Get course statistics.
     */
    public function stats(Course $course)
    {
        $this->authorize('viewStats', $course);

        $stats = [
            'total_students' => $course->getStudents()->count(),
            'total_instructors' => $course->getInstructors()->count(),
            'total_assignments' => $course->assignments()->count(),
            'total_assessments' => $course->assessments()->count(),
            'total_modules' => $course->modules()->count(),
            'total_announcements' => $course->announcements()->count(),
        ];

        return response()->json($stats);
    }
}
