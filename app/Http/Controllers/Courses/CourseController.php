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
use App\Models\User;
use Illuminate\Support\Facades\Log;
use App\Models\EnrollmentRequest;

class CourseController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Course::with(['creator:id,name,email,photo', 'category:id,name,slug']);

        // Apply search filter
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Apply status filter
        if ($status = $request->query('status')) {
            if (in_array($status, ['published', 'archived', 'draft'])) {
                $query->where('status', $status);
            }
        }

        // Apply creator filter for admin
        if ($creator = $request->query('creator')) {
            if ($user->isAdmin() && $creator !== 'all') {
                $query->where('created_by', $creator);
            }
        }

        // Apply sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');

        $query->orderBy($sortBy, $sortOrder);

        if (!$user) {
            // Guest users see only published and non-private courses
            $courses = $query->where('status', 'published')
                             ->where('is_private', false)
                             ->paginate(10);
        } elseif ($user->isAdmin()) {
            // Admin sees all courses (no change needed for private/public filtering)
            $courses = $query->paginate(10);
        } elseif ($user->isInstructor()) {
            // Instructor sees courses they created, and other published non-private courses they are enrolled in
            $courses = $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id) // Courses created by the instructor
                  ->orWhere(function ($q2) use ($user) {
                      $q2->where('is_private', false) // Non-private courses
                         ->where('status', 'published') // and published
                         ->whereHas('enrolledUsers', function ($q3) use ($user) { // and they are enrolled in
                            $q3->where('user_id', $user->id);
                         });
                  });
            })
            ->paginate(10);
        } else {
            // Students logic
            // Students see only published and non-private courses, or any course they are enrolled in
            $courses = $query->where(function ($q) use ($user) {
                $q->where('is_private', false)
                  ->where('status', 'published')
                  ->orWhereHas('enrolledUsers', function ($q2) use ($user) {
                      $q2->where('user_id', $user->id);
                  });
            })
            ->paginate(10);
        }

        // Add enrollment data to each course for authenticated users
        if ($user) {
            Log::info('Adding enrollment data for user:', ['user_id' => $user->id, 'user_role' => $user->role]);
            foreach ($courses as $course) {
                Log::info('Checking enrollment for course:', ['course_id' => $course->id, 'course_name' => $course->name]);

                $enrollment = $course->enrolledUsers()->where('user_id', $user->id)->first();

                if ($enrollment) {
                    Log::info('Found enrollment:', [
                        'course_id' => $course->id,
                        'user_id' => $user->id,
                        'enrolled_as' => $enrollment->pivot->enrolled_as,
                        'created_at' => $enrollment->pivot->created_at
                    ]);

                    $course->pivot = [
                        'enrolled_as' => $enrollment->pivot->enrolled_as,
                        'created_at' => $enrollment->pivot->created_at,
                    ];
                } else {
                    Log::info('No enrollment found for course:', ['course_id' => $course->id, 'user_id' => $user->id]);
                }
            }
        }

        Log::info('Courses data sent to frontend:', ['courses' => $courses->toArray()]);

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'userRole' => $user?->role ?? 'guest',
            'filters' => $request->only('search', 'status', 'creator', 'sort_by', 'sort_order'),
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
            'status' => 'required|in:published,archived,draft',
            'is_private' => 'boolean', // Add validation for is_private
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
            $course->enroll(Auth::id(), 'instructor', Auth::user());

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
        $this->authorize('view', $course); // Apply the policy check here

        $user = Auth::user();

        // If the user is authenticated, and NOT an admin or the course creator,
        // and the course is public and published, and they are NOT enrolled,
        // then redirect to the public show page.
        // This covers the case where a student is authorized by policy (because it's public/published)
        // but should still be directed to the public show if not enrolled or admin/creator.
        if ($user && !$user->isAdmin() && $course->created_by !== $user->id && !$course->enrolledUsers()->where('user_id', $user->id)->exists() && !$course->is_private && $course->status === 'published') {
            return redirect()->route('courses.public_show', $course->id);
        }

        // Determine if user is instructor for this course
        $isInstructor = $user->isAdmin() || $course->created_by === $user->id;

        // Get user enrollment data
        $userEnrollmentData = null;
        if ($user) {
            $userEnrollmentData = $course->enrolledUsers()
                ->where('user_id', $user->id)
                ->first();
        }

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
     * Display the specified course for public/unenrolled users.
     */
    public function publicShow(Course $course): Response
    {
        // If the course is private or not published, guests should not see it
        if (($course->is_private || $course->status !== 'published') && !Auth::check()) {
            return redirect()->route('courses.index')->with('error', 'This course is not publicly available or does not exist.');
        }

        $user = Auth::user();

        // If the course is private, or not published, and the user is not an admin or the creator, deny access.
        if ($course->is_private || $course->status !== 'published') {
            if (!$user || (!$user->isAdmin() && $course->created_by !== $user->id)) {
                abort(403, 'You do not have access to this course.');
            }
        }

        // If the user is already enrolled, or is the creator/admin, directly render the full course show page.
        if ($user && ($user->isAdmin() || $course->created_by === $user->id || $course->enrolledUsers()->where('user_id', $user->id)->exists())) {
            // Re-use the logic from the 'show' method to render the full course page.
            // This avoids a redirect and ensures the return type is Inertia\Response.
            $isInstructor = $user->isAdmin() || $course->created_by === $user->id;

            $userEnrollmentData = $course->enrolledUsers()
                ->where('user_id', $user->id)
                ->first();

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

            $course->load([ // Load all necessary relationships for the full show page
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
            ]);

            return Inertia::render('Courses/Show', [
                'course' => $course,
                'userEnrollment' => $userEnrollment,
                'userRole' => $user->role,
            ]);
        }

        // Fetch limited details for the public view
        $course->load(['creator:id,name,email,photo', 'category:id,name,slug']);

        // Placeholder for pending enrollment request check
        $hasPendingEnrollmentRequest = false;
        if ($user) {
            $hasPendingEnrollmentRequest = EnrollmentRequest::where('user_id', $user->id)
                                            ->where('course_id', $course->id)
                                            ->where('status', 'pending')
                                            ->exists();
        }

        Log::info('Public course data for frontend:', ['course' => $course->toArray()]);

        return Inertia::render('Courses/PublicShow', [
            'course' => $course->load(['category:id,name', 'creator:id,name,photo']),
            'hasPendingEnrollmentRequest' => $hasPendingEnrollmentRequest,
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

        Log::info('Request all data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:published,archived,draft',
            'is_private' => 'boolean', // Add validation for is_private
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        try {
            // Handle image update
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($course->image) {
                    Storage::disk('public')->delete($course->image);
                    Log::info('Deleted old image: ' . $course->image);
                }

                $path = $request->file('image')->store('courses/images', 'public');
                $validated['image'] = $path;
                Log::info('New image uploaded: ' . $path);
            } elseif ($request->has('image_removed') && $request->boolean('image_removed')) {
                // User explicitly wants to remove the image
                if ($course->image) {
                    Storage::disk('public')->delete($course->image);
                    Log::info('Deleted old image due to explicit removal: ' . $course->image);
                }
                $validated['image'] = null; // Explicitly set to null for removal
                Log::info('Image explicitly removed, setting to null.');
            } else {
                // If no new image and not explicitly removed, keep the existing one
                unset($validated['image']);
                Log::info('No new image and not explicitly removed, keeping existing image.');
            }

            $course->update($validated);

            return redirect()->route('courses.index')->with('success', 'Course updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating course:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->with('error', 'An unexpected error occurred while updating the course.')->withInput();
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

    /**
     * Handle a user's request to enroll in a course.
     */
    public function enrollmentRequest(Request $request, Course $course)
    {
        $user = Auth::user();

        // Ensure user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        // Check if the user is already enrolled in the course
        if ($course->enrolledUsers->contains($user->id)) {
            return back()->with('error', 'You are already enrolled in this course.');
        }

        // Check if a pending request already exists for this user and course
        $existingRequest = EnrollmentRequest::where('user_id', $user->id)
                                            ->where('course_id', $course->id)
                                            ->where('status', 'pending')
                                            ->first();

        if ($existingRequest) {
            return back()->with('error', 'You already have a pending enrollment request for this course.');
        }

        // Validate request data (e.g., for an optional message from the user)
        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        try {
            EnrollmentRequest::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'status' => 'pending',
                'message' => $validated['message'] ?? null,
            ]);

            // Optionally, notify admin/instructor about the new request
            // Notification::send(User::where('role', 'admin')->get(), new NewEnrollmentRequest($request));

            return back()->with('success', 'Enrollment request sent successfully! You will be notified once it\'s reviewed.');
        } catch (\Exception $e) {
            Log::error('Error sending enrollment request:', ['error' => $e->getMessage(), 'user_id' => $user->id, 'course_id' => $course->id]);
            return back()->with('error', 'Failed to send enrollment request. Please try again.');
        }
    }
}
