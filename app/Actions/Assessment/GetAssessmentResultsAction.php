<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;

class GetAssessmentResultsAction
{
    public function execute(Course $course, Assessment $assessment): array
    {
        $submission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->firstOrFail();

        $assessment->load(['questions' => function ($query) {
            $query->orderBy('question_number');
        }]);

        return [
            'course' => $course,
            'assessment' => $assessment,
            'submission' => $submission,
        ];
    }
} 