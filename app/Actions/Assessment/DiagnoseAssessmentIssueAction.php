<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DiagnoseAssessmentIssueAction
{
    public function execute(Course $course, Assessment $assessment): array
    {
        $userId = Auth::id();
        
        // Get all submissions for this user and assessment
        $submissions = Submission::where([
            'user_id' => $userId,
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->get();

        $diagnosticData = [
            'user_id' => $userId,
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'assessment_title' => $assessment->title,
            'submissions_count' => $submissions->count(),
            'submissions' => $submissions->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'finished' => $submission->finished,
                    'submitted_at' => $submission->submitted_at,
                    'answers' => $submission->answers ? 'Has answers' : 'No answers',
                    'score' => $submission->score,
                    'created_at' => $submission->created_at,
                    'updated_at' => $submission->updated_at,
                ];
            })->toArray(),
        ];

        // Log the diagnostic data
        Log::info('Assessment diagnostic data', $diagnosticData);

        return $diagnosticData;
    }

    public function cleanupInvalidSubmissions(Course $course, Assessment $assessment): int
    {
        $userId = Auth::id();
        
        // Find submissions that are marked as finished but have no submitted_at date or no answers
        $invalidSubmissions = Submission::where([
            'user_id' => $userId,
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->where(function ($query) {
            $query->where(function ($q) {
                // Finished but no submitted_at
                $q->where('finished', true)->whereNull('submitted_at');
            })->orWhere(function ($q) {
                // Finished but no answers
                $q->where('finished', true)->whereNull('answers');
            });
        })->get();

        $cleanedCount = 0;
        foreach ($invalidSubmissions as $submission) {
            Log::warning('Cleaning up invalid submission', [
                'submission_id' => $submission->id,
                'user_id' => $userId,
                'assessment_id' => $assessment->id,
                'finished' => $submission->finished,
                'submitted_at' => $submission->submitted_at,
                'has_answers' => $submission->answers !== null,
            ]);

            // Reset the submission to unfinished state
            $submission->update([
                'finished' => false,
                'submitted_at' => null,
                'answers' => null,
                'score' => null,
            ]);
            
            $cleanedCount++;
        }

        return $cleanedCount;
    }
}
