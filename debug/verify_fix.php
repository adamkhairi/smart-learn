<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFYING DATABASE UPDATE ===\n";

// Find the current submission for assessment 287
$submission = Submission::where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Submission ID: {$submission->id}\n";
    echo "Score: " . ($submission->score ?? 'NULL') . "\n";
    echo "Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
    echo "Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
    echo "Has Grading Details: " . ($submission->grading_details ? 'Yes (' . count($submission->grading_details) . ')' : 'No') . "\n";
    
    if ($submission->grading_details) {
        $correctCount = 0;
        foreach ($submission->grading_details as $detail) {
            if (isset($detail['is_correct']) && $detail['is_correct']) {
                $correctCount++;
            }
        }
        echo "Correct Answers: {$correctCount}\n";
        
        echo "\nFirst few grading details:\n";
        $count = 0;
        foreach ($submission->grading_details as $questionId => $detail) {
            if ($count >= 3) break;
            echo "Q{$questionId}: Score {$detail['score']}/{$detail['max_score']}, Correct: " . ($detail['is_correct'] ? 'Yes' : 'No') . "\n";
            $count++;
        }
    }
} else {
    echo "Submission not found!\n";
}
