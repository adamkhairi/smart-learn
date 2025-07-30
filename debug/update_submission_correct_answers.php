<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\AutoGradeAssessmentAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== UPDATING SUBMISSION WITH CORRECT ANSWERS ===\n";

// Find the current submission for assessment 287
$submission = Submission::with('assessment.questions')->where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Found submission ID: {$submission->id}\n";
    echo "Assessment: {$submission->assessment->title}\n\n";
    
    echo "Re-running auto-grading with fixed logic...\n";
    $autoGradeAction = new AutoGradeAssessmentAction();
    $results = $autoGradeAction->execute($submission);
    
    echo "Auto-grading completed successfully!\n";
    echo "Total Score: {$results['total_score']}/{$results['max_score']} ({$results['percentage']}%)\n\n";
    
    // Refresh the submission to get updated data
    $submission->refresh();
    
    echo "=== VERIFYING CORRECT ANSWERS IN DATABASE ===\n";
    $gradingDetails = $submission->grading_details;
    
    foreach ($gradingDetails as $questionId => $detail) {
        $question = $submission->assessment->questions->where('id', $questionId)->first();
        if ($question && $question->type === 'MCQ') {
            echo "MCQ Question {$question->question_number} (ID: {$questionId}):\n";
            echo "  User Answer: {$detail['user_answer']}\n";
            echo "  Correct Answer: '{$detail['correct_answer']}'\n";
            echo "  Status: " . ($detail['is_correct'] ? 'Correct' : 'Incorrect') . "\n\n";
        }
    }
    
    echo "✅ Submission updated successfully with correct answers!\n";
    
} else {
    echo "Submission not found!\n";
}
