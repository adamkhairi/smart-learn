<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Models\Question;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== INVESTIGATING MCQ STRUCTURE ===\n";

// Find the current submission for assessment 287
$submission = Submission::with('assessment.questions')->where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Found submission ID: {$submission->id}\n";
    echo "Assessment: {$submission->assessment->title}\n\n";
    
    // Look at MCQ questions specifically
    $mcqQuestions = $submission->assessment->questions->where('type', 'MCQ');
    
    echo "MCQ Questions found: " . $mcqQuestions->count() . "\n\n";
    
    foreach ($mcqQuestions as $question) {
        echo "--- Question ID: {$question->id} ---\n";
        echo "Question Number: {$question->question_number}\n";
        echo "Question Text: " . substr($question->question_text, 0, 50) . "...\n";
        echo "Type: {$question->type}\n";
        echo "Points: {$question->points}\n";
        echo "Correct Answer: {$question->answer}\n";
        
        // Check if question has choices (MCQ options)
        if ($question->choices) {
            echo "Choices:\n";
            foreach ($question->choices as $index => $choice) {
                echo "  [{$index}] {$choice}\n";
            }
        } else {
            echo "No choices found\n";
        }
        
        // Check user's answer for this question
        if (isset($submission->answers[$question->id])) {
            $userAnswer = $submission->answers[$question->id];
            echo "User Answer: {$userAnswer}\n";
        } else {
            echo "No user answer found\n";
        }
        
        // Check grading details for this question
        if (isset($submission->grading_details[$question->id])) {
            $gradingDetail = $submission->grading_details[$question->id];
            echo "Grading Detail:\n";
            echo "  Score: {$gradingDetail['score']}/{$gradingDetail['max_score']}\n";
            echo "  Is Correct: " . ($gradingDetail['is_correct'] ? 'Yes' : 'No') . "\n";
            echo "  User Answer (from grading): " . json_encode($gradingDetail['user_answer']) . "\n";
            echo "  Correct Answer (from grading): " . json_encode($gradingDetail['correct_answer']) . "\n";
        }
        
        echo "\n";
    }
} else {
    echo "Submission not found!\n";
}
