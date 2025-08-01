<?php

namespace App\Actions\Assignment;

use App\Models\Submission;
use App\Actions\Notification\CreateNotificationAction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GradeSubmissionAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

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

        $updated = $submission->update([
            'score' => $data['score'] ?? null,
            'feedback' => $data['feedback'] ?? null,
            'graded_at' => now(),
            'graded_by' => Auth::id(),
            'auto_grading_status' => 'Graded',
            'notes' => $data['grading_notes'] ?? null,
        ]);

        // Send notification to student about the grade
        if ($updated && $submission->user) {
            $moduleItem = \App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assignment')
                ->where('itemable_id', $assignment->id)
                ->first();
            
            $actionUrl = null;
            if ($moduleItem) {
                $actionUrl = "/courses/{$assignment->course_id}/modules/{$moduleItem->course_module_id}/items/{$moduleItem->id}";
            }

            $this->createNotificationAction->createGradeNotification(
                user: $submission->user,
                itemTitle: $assignment->title,
                score: (float) ($data['score'] ?? 0),
                maxScore: $assignment->total_points ? (float) $assignment->total_points : null,
                itemType: 'assignment',
                actionUrl: $actionUrl
            );
        }

        return $updated;
    }
}
