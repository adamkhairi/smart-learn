<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Collection;

class ListCourseModulesAction
{
    public function execute(Course $course): Collection
    {
        $user = Auth::user();
        $isInstructor = $user->isAdmin() || $course->created_by === $user->id;

        $course->load([
            'modules' => function ($query) use ($isInstructor) {
                $query->ordered()->withCount('moduleItems');
                if (!$isInstructor) {
                    $query->where('is_published', true);
                }
            }
        ]);

        return $course->modules;
    }
}
