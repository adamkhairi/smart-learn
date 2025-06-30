<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::withCourseAssignments()
                    ->withCount(['enrollments', 'createdCourses', 'submissions']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply role filter
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        // Apply status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate(15)
                      ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::active()->count(),
                'instructors' => User::role('instructor')->count(),
                'admins' => User::role('admin')->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['admin', 'instructor', 'student'])],
            'mobile' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'mobile' => $validated['mobile'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.users.index')
                        ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load([
            'enrollments',
            'createdCourses',
            'instructorCourses',
            'adminCourses',
            'submissions',
            'articles',
            'followers',
            'follows'
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $user->getStats(),
            'availableCourses' => Course::whereDoesntHave('enrolledUsers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->get()
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load(['enrollments', 'createdCourses']);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'availableCourses' => Course::all()
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'instructor', 'student'])],
            'mobile' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'role' => $validated['role'],
            'mobile' => $validated['mobile'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('admin.users.index')
                        ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        DB::transaction(function () use ($user) {
            // Remove all course enrollments
            $user->enrollments()->detach();

            // Delete the user
            $user->delete();
        });

        return redirect()->route('admin.users.index')
                        ->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->toggleActive();

        return back()->with('success', 'User status updated successfully.');
    }

    /**
     * Assign user to course.
     */
    public function assignToCourse(Request $request, User $user)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'role' => ['required', Rule::in(['student', 'instructor', 'admin'])],
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $user->assignToCourse($course, $validated['role']);

        return back()->with('success', 'User assigned to course successfully.');
    }

    /**
     * Remove user from course.
     */
    public function removeFromCourse(Request $request, User $user)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $user->removeFromCourse($course);

        return back()->with('success', 'User removed from course successfully.');
    }

    /**
     * Update user role in a specific course.
     */
    public function updateCourseRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'role' => ['required', Rule::in(['student', 'instructor', 'admin'])],
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $user->assignToCourse($course, $validated['role']);

        return back()->with('success', 'User role updated successfully.');
    }

    /**
     * Get user statistics.
     */
    public function stats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::active()->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'role_distribution' => [
                'admin' => User::role('admin')->count(),
                'instructor' => User::role('instructor')->count(),
                'student' => User::role('student')->count(),
            ],
            'recent_registrations' => User::orderBy('created_at', 'desc')->limit(5)->get(),
            'top_instructors' => User::role('instructor')
                                   ->withCount('createdCourses')
                                   ->orderBy('created_courses_count', 'desc')
                                   ->limit(5)
                                   ->get(),
        ];

        return Inertia::render('Admin/Users/Stats', [
            'stats' => $stats
        ]);
    }
}
