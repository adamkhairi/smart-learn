<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\User;
use App\Models\Course;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\AssignUserToCourseRequest;
use App\Http\Requests\Admin\RemoveUserFromCourseRequest;
use App\Http\Requests\Admin\UpdateUserCourseRoleRequest;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Actions\User\ListUsersAction;
use App\Actions\User\CreateUserAction;
use App\Actions\User\UpdateUserAction;
use App\Actions\User\DeleteUserAction;
use App\Actions\User\ToggleUserActiveStatusAction;
use App\Actions\User\ManageUserCoursesAction;
use App\Actions\User\GetUserStatsAction;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request, ListUsersAction $listUsersAction)
    {
        $users = $listUsersAction->execute($request);

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
    public function toggleActive(User $user, ToggleUserActiveStatusAction $toggleUserActiveStatusAction)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot deactivate your own account.']);
        }

        try {
            $toggleUserActiveStatusAction->execute($user);

            $status = $user->is_active ? 'activated' : 'deactivated';
            return back()->with('success', "User {$status} successfully.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update user status. Please try again.']);
        }
    }

    /**
     * Assign user to course.
     */
    public function assignToCourse(AssignUserToCourseRequest $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validated();

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
    public function removeFromCourse(RemoveUserFromCourseRequest $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validated();

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
    public function updateCourseRole(UpdateUserCourseRoleRequest $request, User $user, ManageUserCoursesAction $manageCoursesAction)
    {
        $validated = $request->validated();

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
    public function stats(GetUserStatsAction $getUserStatsAction)
    {
        $stats = $getUserStatsAction->execute();

        return Inertia::render('Admin/Users/Stats', [
            'stats' => $stats
        ]);
    }
}
