<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\AutoGradeAssessmentAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== FIXING SUBMISSION FOR ASSESSMENT 287 ===\n";

// Find the current submission for assessment 287
$submission = Submission::where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Found submission ID: {$submission->id}\n";
    echo "Current state:\n";
    echo "- Score: " . ($submission->score ?? 'NULL') . "\n";
    echo "- Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
    echo "- Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
    echo "- Has Answers: " . ($submission->answers ? 'Yes (' . count($submission->answers) . ')' : 'No') . "\n";
    echo "- Has Grading Details: " . ($submission->grading_details ? 'Yes' : 'No') . "\n";
    
    if ($submission->answers && $submission->finished && $submission->submitted_at) {
        echo "\nTriggering auto-grading...\n";
        
        $autoGradeAction = new AutoGradeAssessmentAction();
        $result = $autoGradeAction->execute($submission);
        
        echo "Auto-grading completed!\n";
        echo "Results:\n";
        echo "- Total Score: {$result['total_score']}\n";
        echo "- Max Score: {$result['max_score']}\n";
        echo "- Percentage: {$result['percentage']}%\n";
        echo "- Grading Details: " . count($result['grading_details']) . " questions\n";
        
        // Count correct answers
        $correctCount = 0;
        foreach ($result['grading_details'] as $detail) {
            if ($detail['is_correct']) {
                $correctCount++;
            }
        }
        echo "- Correct Answers: {$correctCount}\n";
        
        echo "\nSubmission has been updated in the database.\n";
    } else {
        echo "Cannot auto-grade: submission is missing required data\n";
        echo "- Finished: " . ($submission->finished ? 'Yes' : 'No') . "\n";
        echo "- Submitted At: " . ($submission->submitted_at ?? 'NULL') . "\n";
        echo "- Has Answers: " . ($submission->answers ? 'Yes' : 'No') . "\n";
    }
} else {
    echo "Submission not found!\n";
}
