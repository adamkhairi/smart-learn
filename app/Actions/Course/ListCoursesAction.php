<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ListCoursesAction
{
    public function execute(Request $request): array
    {
        $user = Auth::user();

        $query = Course::with(['creator:id,name,email,photo', 'category:id,name,slug'])
                       ->withCount('enrolledUsers');

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
            if ($user && $user->isAdmin() && $creator !== 'all') {
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
            // Instructor sees courses they created, and other published courses they are enrolled in (regardless of private status)
            $courses = $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id) // Courses created by the instructor
                  ->orWhere(function ($q2) use ($user) {
                      $q2->where('status', 'published') // Published courses
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

        return [
            'courses' => $courses,
            'userRole' => $user?->role ?? 'guest',
            'filters' => $request->only('search', 'status', 'creator', 'sort_by', 'sort_order'),
        ];
    }
}
