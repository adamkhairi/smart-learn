<?php

namespace App\Actions\Assignment;

use App\Models\Submission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GradeSubmissionAction
{
    public function execute(Submission $submission, \App\Models\Assignment $assignment, array $data): bool
    {
        // Conditional logic for essay grading
        if ($assignment->assignment_type === \App\Enums\AssignmentType::Essay) {
            // Here you can add specific logic for essay grading
            // For example, more detailed feedback processing, or integration with an external essay grading tool.
            // For now, we'll just log a message to indicate it's an essay.
            Log::info('Grading an essay submission.', [
                'submission_id' => $submission->id,
                'assignment_id' => $assignment->id,
                'score' => $data['score'] ?? null,
                'feedback' => $data['feedback'] ?? null,
                'grading_notes' => $data['grading_notes'] ?? null,
            ]);
        }

        return $submission->update([
            'score' => $data['score'] ?? null,
            'feedback' => $data['feedback'] ?? null,
            'graded_at' => now(),
            'graded_by' => Auth::id(),
            'auto_grading_status' => 'Graded',
            'notes' => $data['grading_notes'] ?? null,
        ]);
    }
}
