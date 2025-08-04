<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use App\Enums\CourseLevel;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Display a listing of courses with management features.
     */
    public function index(Request $request): Response
    {
        $query = Course::with(['creator', 'enrolledUsers']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('creator', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Filter by creator
        if ($request->filled('creator') && $request->get('creator') !== 'all') {
            $query->where('created_by', $request->get('creator'));
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $courses = $query->paginate(15)->withQueryString();

        // Get creators for filter
        $creators = User::whereIn('id', Course::distinct()->pluck('created_by'))->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'creators' => $creators,
            'filters' => $request->only(['search', 'status', 'creator', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new course.
     */
    public function create(): Response
    {
        $categories = Category::all();

        return Inertia::render('Admin/Courses/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'created_by' => 'required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:draft,published,archived',
            'files' => 'nullable|array',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        try {
            $course = new Course($validated);

            // Handle image upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('courses/images', 'public');
                $course->image = $path;
            }

            $course->save();

            // Auto-enroll the creator as instructor
            $course->enroll($validated['created_by'], 'instructor', Auth::user());

            return redirect()->route('admin.courses.index')
                ->with('success', 'Course created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create course. Please try again.');
        }
    }

    /**
     * Display the specified course with detailed information.
     */
    public function show(Course $course): Response
    {
        $course->load([
            'creator',
            'enrolledUsers',
            'modules' => function ($query) {
                $query->ordered()->with(['moduleItems' => function ($q) {
                    $q->ordered();
                }]);
            },
            'assignments',
            'assessments',
            'announcements' => function ($query) {
                $query->latest()->limit(10);
            },
            'discussions' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(15);

        return Inertia::render('Admin/Courses/Show', [
            'course' => $course,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Show the form for editing the specified course.
     */
    public function edit(Course $course): Response
    {
        $course->load(['creator', 'enrolledUsers']);
        $categories = Category::all();

        return Inertia::render('Admin/Courses/Edit', [
            'course' => $course,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'created_by' => 'required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:draft,published,archived',
            'files' => 'nullable|array',
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
            } else if ($request->input('image_removed')) {
                // If image was explicitly removed from the frontend
                if ($course->image) {
                    Storage::disk('public')->delete($course->image);
                }
                $validated['image'] = null;
            } else {
                // No new image uploaded, preserve existing one unless explicitly removed
                unset($validated['image']);
            }

            $course->update($validated);

            // Update enrollment if creator changed
            if ($course->created_by !== $validated['created_by']) {
                // Remove old creator enrollment
                $course->unenroll($course->created_by);
                // Add new creator enrollment
                $course->enroll($validated['created_by'], 'instructor');
            }

            return redirect()->route('admin.courses.index')
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
        try {
            // Delete course image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }

            $course->delete();

            return redirect()->route('admin.courses.index')
                ->with('success', 'Course deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete course. Please try again.');
        }
    }

    /**
     * Toggle course status.
     */
    public function toggleStatus(Course $course)
    {
        $newStatus = $course->status === 'published' ? 'archived' : 'published';
        $course->update(['status' => $newStatus]);

        return back()->with('success', "Course {$newStatus} successfully!");
    }

    /**
     * Get course statistics.
     */
    public function stats(Course $course)
    {
        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(20);

        return response()->json([
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Manage course enrollments.
     */
    public function manageEnrollments(Request $request, Course $course)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'role_filter' => 'nullable|string|max:255',
            'enrolled_page' => 'nullable|integer|min:1',
            'available_page' => 'nullable|integer|min:1',
        ]);

        $search = $validated['search'] ?? '';
        $roleFilter = $validated['role_filter'] ?? 'all'; // For enrolled users
        $enrolledPage = $validated['enrolled_page'] ?? 1;
        $availablePage = $validated['available_page'] ?? 1;

        // Enrolled Users Query
        $enrolledUsersQuery = $course->enrolledUsers();

        if (!empty($search)) {
            $enrolledUsersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter !== 'all') {
            $enrolledUsersQuery->wherePivot('enrolled_as', $roleFilter);
        }

        $enrolledUsers = $enrolledUsersQuery->paginate(10, ['*'], 'enrolled_page', $enrolledPage); // Paginate enrolled users

        // Available Users Query
        $availableUsersQuery = User::query();

        // Exclude already enrolled users
        $enrolledUserIds = $course->enrolledUsers()->pluck('users.id');
        $availableUsersQuery->whereNotIn('id', $enrolledUserIds);

        if (!empty($search)) {
            $availableUsersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $availableUsers = $availableUsersQuery->paginate(10, ['*'], 'available_page', $availablePage); // Paginate available users

        return Inertia::render('Admin/Courses/Enrollments', [
            'course' => $course,
            'enrolledUsers' => $enrolledUsers,
            'availableUsers' => $availableUsers,
            'filters' => [
                'search' => $search,
                'role_filter' => $roleFilter,
            ],
        ]);
    }

    /**
     * Enroll users in course.
     */
    public function enrollUsers(Request $request, Course $course)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'role' => 'required|in:student,instructor',
        ]);

        $enrolledCount = 0;
        foreach ($validated['user_ids'] as $userId) {
            try {
                $course->enroll($userId, $validated['role']);
                $enrolledCount++;
            } catch (\Exception $e) {
                // User might already be enrolled, continue
            }
        }

        return back()->with('success', "{$enrolledCount} users enrolled successfully!");
    }

    /**
     * Unenroll users from course.
     */
    public function unenrollUsers(Request $request, Course $course)
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $unenrolledCount = 0;
        foreach ($validated['user_ids'] as $userId) {
            try {
                $course->unenroll($userId);
                $unenrolledCount++;
            } catch (\Exception $e) {
                // User might not be enrolled, continue
            }
        }

        return back()->with('success', "{$unenrolledCount} users unenrolled successfully!");
    }

    /**
     * Get course analytics.
     */
    public function analytics(Course $course)
    {
        $stats = $course->getStats();
        $recentActivity = $course->getRecentActivity(50);

        // Get enrollment trends (last 30 days)
        $enrollmentTrends = $course->enrolledUsers()
            ->wherePivot('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(course_user_enrollments.created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Courses/Analytics', [
            'course' => $course,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'enrollmentTrends' => $enrollmentTrends,
        ]);
    }
}
