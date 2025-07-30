<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\AutoGradeAssessmentAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING AUTO-GRADING PROCESS ===\n";

// Find the current submission for assessment 287
$submission = Submission::with('assessment.questions')->where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Found submission ID: {$submission->id}\n";
    echo "Assessment: {$submission->assessment->title}\n";
    echo "Questions count: " . $submission->assessment->questions->count() . "\n";
    
    echo "\nBefore auto-grading:\n";
    echo "- Score: " . ($submission->score ?? 'NULL') . "\n";
    echo "- Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
    echo "- Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
    echo "- Graded At: " . ($submission->graded_at ?? 'NULL') . "\n";
    echo "- Has Answers: " . ($submission->answers ? 'Yes (' . count($submission->answers) . ')' : 'No') . "\n";
    echo "- Has Grading Details: " . ($submission->grading_details ? 'Yes' : 'No') . "\n";
    
    if ($submission->answers) {
        echo "\nAnswers provided:\n";
        foreach ($submission->answers as $questionId => $answer) {
            echo "- Q{$questionId}: " . (is_string($answer) ? substr($answer, 0, 50) . '...' : json_encode($answer)) . "\n";
        }
    }
    
    echo "\nRunning auto-grading...\n";
    
    try {
        $autoGradeAction = new AutoGradeAssessmentAction();
        $result = $autoGradeAction->execute($submission);
        
        echo "Auto-grading returned:\n";
        echo "- Total Score: {$result['total_score']}\n";
        echo "- Max Score: {$result['max_score']}\n";
        echo "- Percentage: {$result['percentage']}\n";
        echo "- Grading Details Count: " . count($result['grading_details']) . "\n";
        
        // Refresh submission from database
        $submission->refresh();
        
        echo "\nAfter auto-grading (from database):\n";
        echo "- Score: " . ($submission->score ?? 'NULL') . "\n";
        echo "- Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
        echo "- Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
        echo "- Graded At: " . ($submission->graded_at ?? 'NULL') . "\n";
        echo "- Has Grading Details: " . ($submission->grading_details ? 'Yes (' . count($submission->grading_details) . ')' : 'No') . "\n";
        
        if ($submission->grading_details) {
            $correctCount = 0;
            foreach ($submission->grading_details as $detail) {
                if (isset($detail['is_correct']) && $detail['is_correct']) {
                    $correctCount++;
                }
            }
            echo "- Correct Answers: {$correctCount}\n";
        }
        
    } catch (Exception $e) {
        echo "Error during auto-grading: " . $e->getMessage() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
    
} else {
    echo "Submission not found!\n";
}
