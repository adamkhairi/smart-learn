<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\AutoGradeAssessmentAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== FIXING SUBMISSION GRADING ===\n";

// Find the submission that needs to be fixed
$submission = Submission::where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Found submission ID: {$submission->id}\n";
    echo "Current score: {$submission->score}/{$submission->max_score} ({$submission->percentage}%)\n\n";
    
    // Re-run auto-grading with the fixed logic
    $autoGradeAction = new AutoGradeAssessmentAction();
    
    echo "Re-running auto-grading with fixed MCQ logic...\n";
    try {
        $results = $autoGradeAction->execute($submission);
        
        echo "Updated grading results:\n";
        echo "New score: {$results['total_score']}/{$results['max_score']} ({$results['percentage']}%)\n\n";
        
        echo "MCQ Questions that are now correct:\n";
        foreach ($results['grading_details'] as $questionId => $detail) {
            if ($detail['is_correct'] && strpos($detail['question_text'], '?') !== false) {
                echo "- Question {$questionId}: {$detail['user_answer']} = {$detail['correct_answer']} ✓\n";
            }
        }
        
        echo "\nSubmission successfully updated!\n";
        
    } catch (Exception $e) {
        echo "Error running auto-grading: " . $e->getMessage() . "\n";
    }
    
} else {
    echo "Submission not found!\n";
}
