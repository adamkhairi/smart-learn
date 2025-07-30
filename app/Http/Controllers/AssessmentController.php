<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\Assessment\TakeAssessmentAction;
use App\Actions\Assessment\SubmitAssessmentAction;
use App\Actions\Assessment\GetAssessmentResultsAction;
use Illuminate\Support\Facades\Log;

class AssessmentController extends Controller
{
    /**
     * Show the assessment taking interface.
     */
    public function take(Course $course, Assessment $assessment, TakeAssessmentAction $takeAssessmentAction): Response|RedirectResponse
    {
        $this->authorize('view', $course);

        try {
            $data = $takeAssessmentAction->execute($course, $assessment);
            // If the action returned a RedirectResponse, return it directly
            if ($data instanceof RedirectResponse) {
                return $data;
            }
            return Inertia::render('Assessments/Take', $data);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Submit assessment answers.
     */
    public function submit(Request $request, Course $course, Assessment $assessment, SubmitAssessmentAction $submitAssessmentAction)
    {
        $this->authorize('view', $course);

        $validated = $request->validate([
            'answers' => 'required|array',
            'time_spent' => 'nullable|integer',
        ]);

        try {
            $submitAssessmentAction->execute($validated, $course, $assessment);
            return redirect()->route('assessments.results', [
                'course' => $course,
                'assessment' => $assessment,
            ])->with('success', 'Assessment submitted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show assessment results.
     */
    public function results(Course $course, Assessment $assessment, GetAssessmentResultsAction $getAssessmentResultsAction): Response|RedirectResponse
    {
        $this->authorize('view', $course);

        Log::info('AssessmentController::results called', [
            'course_id' => $course->id,
            'assessment_id' => $assessment->id,
            'user_id' => auth()->id(),
            'request_url' => request()->url(),
        ]);

        try {
            $data = $getAssessmentResultsAction->execute($course, $assessment);
            Log::info('AssessmentController::results - data retrieved successfully');
            return Inertia::render('Assessments/Results', $data);
        } catch (\Exception $e) {
            Log::error('AssessmentController::results - Exception caught', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('courses.show', $course)->with('error', $e->getMessage());
        }
    }
}
