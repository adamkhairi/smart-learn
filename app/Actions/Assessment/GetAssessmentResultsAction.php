<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;
use App\Actions\Assessment\AutoGradeAssessmentAction;
use Illuminate\Support\Facades\Log;

class GetAssessmentResultsAction
{
    public function execute(Course $course, Assessment $assessment): array
    {
        Log::info('GetAssessmentResultsAction: Starting execution', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ]);

        $submission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->first();

        if (!$submission) {
            Log::warning('GetAssessmentResultsAction: No submission found', [
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'assessment_id' => $assessment->id,
            ]);
            throw new \Exception('No submission found for this assessment. Please take the assessment first.');
        }

        Log::info('GetAssessmentResultsAction: Found submission', [
            'submission_id' => $submission->id,
            'finished' => $submission->finished,
            'submitted_at' => $submission->submitted_at,
            'has_answers' => $submission->answers !== null,
        ]);

        // If submission is finished but doesn't have grading details, trigger auto-grading
        if ($submission->finished && $submission->submitted_at && $submission->answers && !$submission->grading_details) {
            $autoGradeAction = new AutoGradeAssessmentAction();
            $autoGradeAction->execute($submission);
            $submission->refresh();
        }

        $assessment->load(['questions' => function ($query) {
            $query->select('*')->orderBy('question_number');
        }, 'moduleItem.courseModule']);

        return [
            'course' => $course,
            'assessment' => $assessment,
            'submission' => $submission,
            'module' => $assessment->moduleItem?->courseModule,
        ];
    }
}
