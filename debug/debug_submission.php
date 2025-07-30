<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\AutoGradeAssessmentAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find the submission for assessment 287
$submission = Submission::where('assessment_id', 287)->first();

if ($submission) {
    echo "=== SUBMISSION DEBUG INFO ===\n";
    echo "Submission ID: " . $submission->id . "\n";
    echo "Assessment ID: " . $submission->assessment_id . "\n";
    echo "User ID: " . $submission->user_id . "\n";
    echo "Score: " . ($submission->score ?? 'NULL') . "\n";
    echo "Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
    echo "Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
    echo "Finished: " . ($submission->finished ? 'true' : 'false') . "\n";
    echo "Submitted At: " . ($submission->submitted_at ?? 'NULL') . "\n";
    echo "Graded At: " . ($submission->graded_at ?? 'NULL') . "\n";
    echo "Has Answers: " . ($submission->answers ? 'Yes' : 'No') . "\n";
    echo "Has Grading Details: " . ($submission->grading_details ? 'Yes' : 'No') . "\n";
    
    if ($submission->grading_details) {
        echo "Grading Details Count: " . count($submission->grading_details) . "\n";
        $correctCount = 0;
        foreach ($submission->grading_details as $detail) {
            if (isset($detail['is_correct']) && $detail['is_correct']) {
                $correctCount++;
            }
        }
        echo "Correct Answers: " . $correctCount . "\n";
    } else {
        echo "No grading details found - triggering auto-grading...\n";
        
        if ($submission->finished && $submission->submitted_at && $submission->answers) {
            $autoGradeAction = new AutoGradeAssessmentAction();
            $result = $autoGradeAction->execute($submission);
            echo "Auto-grading completed!\n";
            echo "New Score: " . $result['total_score'] . "\n";
            echo "New Max Score: " . $result['max_score'] . "\n";
            echo "New Percentage: " . $result['percentage'] . "\n";
            echo "Grading Details Count: " . count($result['grading_details']) . "\n";
        } else {
            echo "Cannot auto-grade: submission not properly finished\n";
        }
    }
} else {
    echo "No submission found for assessment 287\n";
}
