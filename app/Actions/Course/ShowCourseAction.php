<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;

class ShowCourseAction
{
    public function execute(Course $course): array
    {
        $user = Auth::user();

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
            'assessments:id,title,course_id,max_score,type',
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

        return [
            'course' => $course,
            'userEnrollment' => $userEnrollment,
            'userRole' => $user->role,
        ];
    }
}
