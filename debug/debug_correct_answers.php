<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Models\Question;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING CORRECT ANSWERS ===\n";

// Find the current submission for assessment 287
$submission = Submission::with('assessment.questions')->where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Submission ID: {$submission->id}\n";
    echo "Assessment: {$submission->assessment->title}\n\n";
    
    echo "=== GRADING DETAILS ANALYSIS ===\n";
    $gradingDetails = $submission->grading_details;
    
    if ($gradingDetails && is_array($gradingDetails)) {
        foreach ($gradingDetails as $questionId => $detail) {
            echo "Question ID: {$questionId}\n";
            echo "  User Answer: " . json_encode($detail['user_answer'] ?? 'null') . "\n";
            echo "  Correct Answer: " . json_encode($detail['correct_answer'] ?? 'null') . "\n";
            echo "  Is Correct: " . ($detail['is_correct'] ? 'Yes' : 'No') . "\n";
            echo "  Score: {$detail['score']}/{$detail['max_score']}\n";
            
            // Get the actual question to see what the correct answer should be
            $question = $submission->assessment->questions->where('id', $questionId)->first();
            if ($question) {
                echo "  Question Type: {$question->type}\n";
                echo "  Question Answer Field: " . json_encode($question->answer) . "\n";
                if ($question->choices) {
                    echo "  Question Choices: " . json_encode($question->choices) . "\n";
                }
            }
            echo "\n";
        }
    } else {
        echo "No grading details found or not an array\n";
    }
    
    echo "=== CHECKING AUTO-GRADING LOGIC ===\n";
    // Let's also check what the AutoGradeAssessmentAction would produce
    $autoGradeAction = new \App\Actions\Assessment\AutoGradeAssessmentAction();
    
    echo "Re-running auto-grading to see what correct answers should be...\n";
    try {
        $results = $autoGradeAction->execute($submission);
        echo "Auto-grading results:\n";
        print_r($results);
    } catch (Exception $e) {
        echo "Error running auto-grading: " . $e->getMessage() . "\n";
    }
    
} else {
    echo "Submission not found!\n";
}
