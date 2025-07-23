<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\EnrollmentRequest; // Add this import

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user && $user->isStudent()) {
            // Student-specific statistics
            $enrolledCourses = $user->enrollments()
                                   ->with(['creator', 'category'])
                                   ->limit(5)
                                   ->get();

            $latestSubmissions = $user->submissions()
                                     ->with(['assignment', 'assessment', 'course'])
                                     ->orderByDesc('submitted_at')
                                     ->limit(5)
                                     ->get();

            $overallProgress = [
                'total_courses_enrolled' => $user->enrollments()->count(),
                'completed_courses' => $user->progress()->where('status', 'completed')->distinct('course_id')->count(),
                'total_completed_items' => $user->progress()->where('status', 'completed')->count(),
                'total_items_in_enrolled_courses' => 0, // This will be calculated below
                'average_score' => $user->submissions()->avg('score') ?? 0,
            ];

            // Calculate total items in enrolled courses
            $totalItems = 0;
            foreach ($user->enrollments()->with('modules.moduleItems')->get() as $course) {
                foreach ($course->modules as $module) {
                    $totalItems += $module->moduleItems->count();
                }
            }
            $overallProgress['total_items_in_enrolled_courses'] = $totalItems;


            $studentStats = $user->getStats(); // Re-use the existing getStats method

            return Inertia::render('Dashboard/dashboard', [
                'studentDashboardData' => [
                    'user' => $user,
                    'enrolled_courses' => $enrolledCourses,
                    'latest_submissions' => $latestSubmissions,
                    'overall_progress' => $overallProgress,
                    'personal_stats' => $studentStats,
                ],
            ]);
        }

        // Existing global statistics for non-students (admins/instructors)
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        $roleDistribution = User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $recentRegistrations = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $topInstructors = User::where('role', 'instructor')
            ->withCount('createdCourses')
            ->orderByDesc('created_courses_count')
            ->limit(5)
            ->get();

        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', 'published')->count();
        $draftCourses = Course::where('status', 'draft')->count();
        $archivedCourses = Course::where('status', 'archived')->count();

        $courseLevelDistribution = Course::selectRaw('level, count(*) as count')
            ->groupBy('level')
            ->pluck('count', 'level')
            ->toArray();

        $latestCourses = Course::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $pendingEnrollmentRequestsCount = 0;
        if ($user && $user->isAdmin()) {
            $pendingEnrollmentRequestsCount = EnrollmentRequest::where('status', 'pending')->count();
        }

        return Inertia::render('Dashboard/dashboard', [
            'userStats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'role_distribution' => $roleDistribution,
                'recent_registrations' => $recentRegistrations,
                'top_instructors' => $topInstructors,
            ],
            'courseStats' => [
                'total_courses' => $totalCourses,
                'published_courses' => $publishedCourses,
                'draft_courses' => $draftCourses,
                'archived_courses' => $archivedCourses,
                'level_distribution' => $courseLevelDistribution,
                'latest_courses' => $latestCourses,
            ],
            'pendingEnrollmentRequestsCount' => $pendingEnrollmentRequestsCount,
        ]);
    }
}
