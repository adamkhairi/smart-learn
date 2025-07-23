<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SubmitAssessmentAction
{
    public function execute(array $validatedData, Course $course, Assessment $assessment): Submission
    {
        Log::info('Assessment submission received', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'answers_count' => count($validatedData['answers']),
            'time_spent' => $validatedData['time_spent'] ?? 0,
        ]);

        $submission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->firstOrFail();

        if ($submission->finished) {
            throw new \Exception('Assessment already submitted.');
        }

        $submission->update([
            'answers' => $validatedData['answers'],
            'finished' => true,
            'submitted_at' => now(),
        ]);

        if ($assessment->questions()->where('auto_graded', true)->exists()) {
            (new AutoGradeSubmissionAction())->execute($submission);
        }

        $progress = UserProgress::getOrCreate(
            Auth::id(),
            $course->id,
            null,
            $assessment->moduleItem?->id
        );
        $progress->markAsCompleted();

        if ($validatedData['time_spent'] ?? false) {
            $progress->addTimeSpent($validatedData['time_spent']);
        }

        return $submission;
    }
} 