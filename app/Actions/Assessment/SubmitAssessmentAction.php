<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class SubmitAssessmentAction
{
    public function execute(array $validated, Course $course, Assessment $assessment): array
    {
        DB::beginTransaction();

        try {
            $submission = Submission::where([
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'assessment_id' => $assessment->id,
            ])->first();

            if (!$submission) {
                throw new Exception('No submission found for this assessment.');
            }

            if ($submission->finished) {
                throw new Exception('This assessment has already been submitted.');
            }

            // Update submission with answers
            $submission->update([
                'answers' => $validated['answers'],
                'time_spent' => $validated['time_spent'] ?? 0,
                'finished' => true,
                'submitted_at' => now(),
            ]);

            // Auto-grade the assessment if it has gradeable questions
            $gradingResults = null;
            if ($this->canAutoGrade($assessment)) {
                $autoGradeAction = new AutoGradeAssessmentAction();
                $gradingResults = $autoGradeAction->execute($submission);
            }

            // Update user progress
            $progress = UserProgress::getOrCreate(
                Auth::id(),
                $course->id,
                null,
                $assessment->moduleItem?->id
            );
            $progress->markAsCompleted();

            if ($validated['time_spent'] ?? false) {
                $progress->addTimeSpent($validated['time_spent']);
            }

            DB::commit();

            return [
                'submission' => $submission->fresh(),
                'grading_results' => $gradingResults,
                'auto_graded' => $gradingResults !== null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function canAutoGrade(Assessment $assessment): bool
    {
        // Check if assessment has questions that can be auto-graded
        $autoGradeableTypes = ['MCQ', 'TrueFalse', 'ShortAnswer'];
        
        return $assessment->questions()->whereIn('type', $autoGradeableTypes)->exists();
    }
}