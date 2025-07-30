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
            $query->ordered()->with(['itemable']);
        }]);
        
        // Load submission data for assessments for students
        if (!$isInstructor) {
            $module->moduleItems->each(function ($item) use ($user) {
                if ($item->itemable_type === 'App\\Models\\Assessment' && $item->itemable) {
                    // Load the user's submission for this assessment
                    $submission = $item->itemable->submissions()
                        ->where('user_id', $user->id)
                        ->where('finished', true)
                        ->whereNotNull('submitted_at')
                        ->latest('submitted_at')
                        ->first();
                    
                    $item->user_submission = $submission ? [
                        'id' => $submission->id,
                        'finished' => $submission->finished,
                        'submitted_at' => $submission->submitted_at,
                        'score' => $submission->score
                    ] : null;
                }
            });
        }

        $course->created_by = $course->created_by ?? $course->user_id;

        return [
            'course' => $course->load('creator'),
            'module' => $module,
        ];
    }
}
