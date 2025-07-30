<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Models\Question;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFYING MCQ FIX ===\n";

// Find the current submission for assessment 287
$submission = Submission::with('assessment.questions')->where('assessment_id', 287)
    ->where('user_id', 62)
    ->where('id', 280)
    ->first();

if ($submission) {
    echo "Submission ID: {$submission->id}\n";
    echo "Assessment: {$submission->assessment->title}\n\n";
    
    // Check MCQ questions specifically
    $mcqQuestions = $submission->assessment->questions->where('type', 'MCQ');
    
    echo "=== MCQ QUESTIONS VERIFICATION ===\n";
    foreach ($mcqQuestions as $question) {
        echo "Question {$question->question_number} (ID: {$question->id}):\n";
        echo "  Question: " . substr($question->question_text, 0, 50) . "...\n";
        
        // User's answer (stored as index)
        $userAnswerIndex = $submission->answers[$question->id] ?? 'No answer';
        echo "  User Answer Index: {$userAnswerIndex}\n";
        
        // Available choices
        if ($question->choices && is_array($question->choices)) {
            echo "  Available Choices:\n";
            foreach ($question->choices as $index => $choice) {
                $marker = ($index == $userAnswerIndex) ? " ← USER'S CHOICE" : "";
                echo "    [{$index}] {$choice}{$marker}\n";
            }
        }
        
        // What should be displayed (the actual choice text)
        if ($question->choices && isset($question->choices[$userAnswerIndex])) {
            echo "  ✅ SHOULD DISPLAY: '{$question->choices[$userAnswerIndex]}'\n";
        } else {
            echo "  ❌ PROBLEM: Cannot map index {$userAnswerIndex} to choice text\n";
        }
        
        echo "\n";
    }
} else {
    echo "Submission not found!\n";
}
