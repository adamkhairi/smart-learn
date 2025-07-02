<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use App\Models\Course;
use App\Actions\Users\CreateUserAction;
use App\Actions\Users\UpdateUserAction;
use App\Actions\Users\DeleteUserAction;
use App\Actions\Users\ManageUserCoursesAction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::withCount(['enrollments', 'createdCourses', 'submissions']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply role filter
        if ($request->filled('role') && $request->role !== 'all') {
            $query->role($request->role);
        }

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->active();
            } else {
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
    public function store(UserRequest $request, CreateUserAction $createUserAction)
    {
        try {
            $createUserAction->execute($request->validated());

            return redirect()->route('admin.users.index')
                            ->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create user. Please try again.']);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load(['enrollments', 'createdCourses']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'stats' => $user->getStats(),
            'availableCourses' => Course::whereDoesntHave('enrolledUsers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->select('id', 'name', 'description')->get()
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $user->load('enrollments');

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'availableCourses' => Course::whereDoesntHave('enrolledUsers', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->select('id', 'name', 'description')->get()
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(UserRequest $request, User $user, UpdateUserAction $updateUserAction)
    {
        try {
            $updateUserAction->execute($user, $request->validated());

            return redirect()->route('admin.users.index')
                            ->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update user. Please try again.']);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user, DeleteUserAction $deleteUserAction)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        try {
            $deleteUserAction->execute($user);

            return redirect()->route('admin.users.index')
                            ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete user. Please try again.']);
        }
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot deactivate your own account.']);
        }

        try {
            $user->toggleActive();

            $status = $user->is_active ? 'activated' : 'deactivated';
            return back()->with('success', "User {$status} successfully.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update user status. Please try again.']);
        }
    }

    /**
     * Assign user to course.
     */
    public function assignToCourse(Request $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'role' => ['required', Rule::in(['student', 'instructor', 'admin'])],
        ]);

        try {
            $manageCoursesAction->assignToCourse($user, $validated['course_id'], $validated['role']);

            return back()->with('success', 'User assigned to course successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove user from course.
     */
    public function removeFromCourse(Request $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        try {
            $manageCoursesAction->removeFromCourse($user, $validated['course_id']);

            return back()->with('success', 'User removed from course successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update user role in a specific course.
     */
    public function updateCourseRole(Request $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'role' => ['required', Rule::in(['student', 'instructor', 'admin'])],
        ]);

        try {
            $manageCoursesAction->updateCourseRole($user, $validated['course_id'], $validated['role']);

            return back()->with('success', 'User role updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
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
