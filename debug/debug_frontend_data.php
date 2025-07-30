<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Actions\Assessment\GetAssessmentResultsAction;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING FRONTEND DATA ===\n";

// Simulate what the frontend receives
$getResultsAction = new GetAssessmentResultsAction();

// Find the course and assessment
$course = \App\Models\Course::find(25);
$assessment = \App\Models\Assessment::find(287);

if ($course && $assessment) {
    echo "Course: {$course->title}\n";
    echo "Assessment: {$assessment->title}\n\n";
    
    // First, let's find the actual submission
    $submission = \App\Models\Submission::where('assessment_id', 287)
        ->where('user_id', 62)
        ->where('id', 280)
        ->first();
    
    if (!$submission) {
        echo "Submission not found!\n";
        return;
    }
    
    echo "Found submission ID: {$submission->id}\n\n";
    
    // Get the results as the frontend would receive them
    // Note: We need to check how GetAssessmentResultsAction actually works
    echo "=== DIRECT SUBMISSION DATA ===\n";
    echo "Raw submission data:\n";
    echo "- Score: " . ($submission->score ?? 'null') . "\n";
    echo "- Max Score: " . ($submission->max_score ?? 'null') . "\n";
    echo "- Percentage: " . ($submission->percentage ?? 'null') . "\n";
    echo "- Grading Details: " . (isset($submission->grading_details) ? 'present' : 'missing') . "\n\n";
    
    if (isset($submission->grading_details)) {
        echo "=== GRADING DETAILS ANALYSIS ===\n";
        foreach ($submission->grading_details as $questionId => $detail) {
            echo "Question ID: {$questionId}\n";
            echo "  User Answer: " . json_encode($detail['user_answer'] ?? 'null') . "\n";
            echo "  Correct Answer: " . json_encode($detail['correct_answer'] ?? 'null') . "\n";
            echo "  Correct Answer Type: " . gettype($detail['correct_answer'] ?? null) . "\n";
            echo "  Correct Answer Empty Check: " . (empty($detail['correct_answer']) ? 'true' : 'false') . "\n";
            echo "  Correct Answer Null Check: " . (is_null($detail['correct_answer']) ? 'true' : 'false') . "\n";
            echo "  Correct Answer === '': " . (($detail['correct_answer'] ?? null) === '' ? 'true' : 'false') . "\n";
            
            // Check frontend condition from Results.tsx
            $correctAnswer = $detail['correct_answer'] ?? null;
            $frontendCondition = ($correctAnswer !== null && $correctAnswer !== '');
            echo "  Frontend Condition (should show): " . ($frontendCondition ? 'true' : 'false') . "\n";
            echo "\n";
        }
    }
    
    echo "=== ASSESSMENT QUESTIONS FOR FRONTEND ===\n";
    echo "Assessment questions count: " . ($results['assessment']->questions ? $results['assessment']->questions->count() : 'null') . "\n";
    if ($results['assessment']->questions) {
        foreach ($results['assessment']->questions as $question) {
            if ($question->type === 'MCQ') {
                echo "MCQ Question {$question->question_number} (ID: {$question->id}):\n";
                echo "  Choices: " . json_encode($question->choices) . "\n";
                echo "  Answer: " . json_encode($question->answer) . "\n";
                echo "\n";
            }
        }
    }
    
} else {
    echo "Course or Assessment not found!\n";
}
