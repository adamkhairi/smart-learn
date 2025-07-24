<?php

namespace App\Actions\CourseModules;

use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Support\Facades\Auth;
use Exception;

class ShowCourseModuleAction
{
    public function execute(Course $course, CourseModule $module): array
    {
        if ($module->course_id !== $course->id) {
            abort(404);
        }

        $user = Auth::user();
        $isInstructor = $user->isAdmin() || $course->created_by === $user->id;

        if (!$isInstructor && !$module->is_published) {
            throw new Exception('This module is not available yet.');
        }

        $module->refresh();
        $module->load(['moduleItems' => function ($query) {
            $query->ordered();
        }]);

        $course->created_by = $course->created_by ?? $course->user_id;

        return [
            'course' => $course->load('creator'),
            'module' => $module,
        ];
    }
}
