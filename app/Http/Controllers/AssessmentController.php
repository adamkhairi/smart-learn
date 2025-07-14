<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    /**
     * Show the assessment taking interface.
     */
    public function take(Course $course, Assessment $assessment): Response|RedirectResponse
    {
        $this->authorize('view', $course);

        // Check if user is enrolled in the course
        if (!$course->enrolledUsers()->where('user_id', Auth::id())->exists()) {
            return redirect()->route('courses.show', $course)->with('error', 'You must be enrolled in this course to take assessments.');
        }

        // Check if assessment is available
        if (!$assessment->isPublished()) {
            abort(404, 'This assessment is not available.');
        }

        // Check if user has already submitted this assessment
        $existingSubmission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'finished' => true,
        ])->first();

        if ($existingSubmission) {
            // Redirect to results if already completed
            return redirect()->route('assessments.results', [
                'course' => $course,
                'assessment' => $assessment,
            ]);
        }

        // Load questions with proper ordering
        $assessment->load(['questions' => function ($query) {
            $query->orderBy('question_number');
        }]);

        // Get or create submission
        $submission = Submission::firstOrCreate([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ], [
            'finished' => false,
            'submitted_at' => null,
        ]);

        // Mark progress as started
        $progress = UserProgress::getOrCreate(
            Auth::id(),
            $course->id,
            null,
            $assessment->moduleItem?->id
        );
        $progress->markAsStarted();

        return Inertia::render('Assessments/Take', [
            'course' => $course,
            'assessment' => $assessment,
            'submission' => $submission,
            'timeRemaining' => $this->calculateTimeRemaining($assessment, $submission),
        ]);
    }

    /**
     * Submit assessment answers.
     */
    public function submit(Request $request, Course $course, Assessment $assessment)
    {
        $this->authorize('view', $course);

        $validated = $request->validate([
            'answers' => 'required|array',
            'time_spent' => 'nullable|integer',
        ]);

        // Debug logging
        \Log::info('Assessment submission received', [
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'answers_count' => count($validated['answers']),
            'time_spent' => $validated['time_spent'] ?? 0,
        ]);

        $submission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->firstOrFail();

        // Check if already submitted
        if ($submission->finished) {
            return redirect()->route('assessments.results', [
                'course' => $course,
                'assessment' => $assessment,
            ])->with('error', 'Assessment already submitted.');
        }

        // Update submission
        $submission->update([
            'answers' => $validated['answers'],
            'finished' => true,
            'submitted_at' => now(),
        ]);

        // Auto-grade if possible
        if ($assessment->questions()->where('auto_graded', true)->exists()) {
            $this->autoGradeSubmission($submission);
        }

        // Update progress
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

        // Redirect to results page instead of module item
        return redirect()->route('assessments.results', [
            'course' => $course,
            'assessment' => $assessment,
        ])->with('success', 'Assessment submitted successfully!');
    }

    /**
     * Show assessment results.
     */
    public function results(Course $course, Assessment $assessment): Response
    {
        $this->authorize('view', $course);

        $submission = Submission::where([
            'user_id' => Auth::id(),
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
        ])->firstOrFail();

        $assessment->load(['questions' => function ($query) {
            $query->orderBy('question_number');
        }]);

        return Inertia::render('Assessments/Results', [
            'course' => $course,
            'assessment' => $assessment,
            'submission' => $submission,
        ]);
    }

    /**
     * Calculate remaining time for assessment.
     */
    private function calculateTimeRemaining(Assessment $assessment, Submission $submission): ?int
    {
        if (!$assessment->time_limit) {
            return null;
        }

        $startTime = $submission->created_at;
        $timeLimit = $assessment->time_limit * 60; // Convert to seconds
        $elapsed = now()->diffInSeconds($startTime);

        return max(0, $timeLimit - $elapsed);
    }

    /**
     * Auto-grade a submission.
     */
    private function autoGradeSubmission(Submission $submission): void
    {
        $assessment = $submission->assessment;
        $answers = $submission->answers ?? [];
        $totalScore = 0;
        $maxScore = 0;

        foreach ($assessment->questions as $question) {
            $maxScore += $question->points;

            if ($question->auto_graded && isset($answers[$question->id])) {
                $userAnswer = $answers[$question->id];

                switch ($question->type) {
                    case 'MCQ':
                        if (strtolower(trim($userAnswer)) === strtolower(trim($question->answer))) {
                            $totalScore += $question->points;
                        }
                        break;

                    case 'TrueFalse':
                        if (strtolower(trim($userAnswer)) === strtolower(trim($question->answer))) {
                            $totalScore += $question->points;
                        }
                        break;

                    case 'Essay':
                        // Basic keyword matching for essays
                        if ($question->usesTextMatch() && $question->keywords) {
                            $keywords = $question->keywords;
                            $answerText = strtolower($userAnswer);
                            $matchedKeywords = 0;

                            foreach ($keywords as $keyword) {
                                if (str_contains($answerText, strtolower($keyword))) {
                                    $matchedKeywords++;
                                }
                            }

                            $matchPercentage = count($keywords) > 0 ? $matchedKeywords / count($keywords) : 0;
                            $totalScore += $question->points * $matchPercentage;
                        }
                        break;
                }
            }
        }

        $submission->update([
            'score' => $totalScore,
            'auto_grading_status' => 'Graded',
            'graded_at' => now(),
        ]);
    }
}
