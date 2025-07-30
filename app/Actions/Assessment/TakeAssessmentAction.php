<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\RedirectResponse;

class TakeAssessmentAction
{
    public function execute(Course $course, Assessment $assessment): array|RedirectResponse
    {
        if (!$course->enrolledUsers()->where('user_id', Auth::id())->exists()) {
            return redirect()->route('courses.show', $course)->with('error', 'You must be enrolled in this course to take assessments.');
        }

        if (!$assessment->isPublished()) {
            abort(404, 'This assessment is not available.');
        }

        // Check for existing completed submission
        $existingSubmission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->first();

        // Log diagnostic information for debugging
        if ($existingSubmission) {
            Log::info('Found existing submission for assessment', [
                'user_id' => Auth::id(),
                'assessment_id' => $assessment->id,
                'submission_id' => $existingSubmission->id,
                'finished' => $existingSubmission->finished,
                'submitted_at' => $existingSubmission->submitted_at,
                'has_answers' => $existingSubmission->answers !== null,
                'score' => $existingSubmission->score,
            ]);
        }

        // Only redirect to results if submission exists AND is actually finished AND has been submitted AND has answers
        if ($existingSubmission && 
            $existingSubmission->finished === true && 
            $existingSubmission->submitted_at !== null &&
            $existingSubmission->answers !== null) {
            
            Log::info('Redirecting to results page', [
                'user_id' => Auth::id(),
                'assessment_id' => $assessment->id,
                'submission_id' => $existingSubmission->id,
            ]);
            
            return redirect()->route('assessments.results', [
                'course' => $course,
                'assessment' => $assessment,
            ]);
        }

        // If we have an invalid finished submission (finished but no answers or submitted_at), reset it
        if ($existingSubmission && 
            $existingSubmission->finished === true && 
            ($existingSubmission->submitted_at === null || $existingSubmission->answers === null)) {
            
            Log::warning('Found invalid finished submission, resetting it', [
                'user_id' => Auth::id(),
                'assessment_id' => $assessment->id,
                'submission_id' => $existingSubmission->id,
                'submitted_at' => $existingSubmission->submitted_at,
                'has_answers' => $existingSubmission->answers !== null,
            ]);
            
            $existingSubmission->update([
                'finished' => false,
                'submitted_at' => null,
                'answers' => null,
                'score' => null,
            ]);
        }

        $assessment->load(['questions' => function ($query) {
            $query->select('*')->orderBy('question_number');
        }, 'moduleItem.courseModule']);

        // If we have an existing submission that's not finished, use it
        // Otherwise create a new one
        if ($existingSubmission && !$existingSubmission->finished) {
            $submission = $existingSubmission;
        } else {
            $submission = Submission::create([
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'assessment_id' => $assessment->id,
                'finished' => false,
                'submitted_at' => null,
                'answers' => null,
                'score' => null,
            ]);
        }

        $progress = UserProgress::getOrCreate(
            Auth::id(),
            $course->id,
            null,
            $assessment->moduleItem?->id
        );
        $progress->markAsStarted();

        return [
            'course' => $course,
            'assessment' => $assessment,
            'submission' => $submission,
            'module' => $assessment->moduleItem?->courseModule,
            'timeRemaining' => (new CalculateAssessmentTimeRemainingAction())->execute($assessment, $submission),
        ];
    }
}
