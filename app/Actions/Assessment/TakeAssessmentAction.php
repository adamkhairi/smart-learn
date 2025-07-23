<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Auth;
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

        $existingSubmission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'finished' => true,
        ])->first();

        if ($existingSubmission) {
            return redirect()->route('assessments.results', [
                'course' => $course,
                'assessment' => $assessment,
            ]);
        }

        $assessment->load(['questions' => function ($query) {
            $query->orderBy('question_number');
        }]);

        $submission = Submission::firstOrCreate([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ], [
            'finished' => false,
            'submitted_at' => null,
        ]);

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
            'timeRemaining' => (new CalculateAssessmentTimeRemainingAction())->execute($assessment, $submission),
        ];
    }
}
