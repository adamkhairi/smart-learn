<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Submission;
use App\Models\Assessment;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING ALL RECENT SUBMISSIONS ===\n";

// Get recent submissions
$submissions = Submission::with('assessment')
    ->where('finished', true)
    ->orderBy('submitted_at', 'desc')
    ->take(10)
    ->get();

foreach ($submissions as $submission) {
    echo "\n--- Submission ID: {$submission->id} ---\n";
    echo "Assessment: {$submission->assessment->title} (ID: {$submission->assessment_id})\n";
    echo "User ID: {$submission->user_id}\n";
    echo "Score: " . ($submission->score ?? 'NULL') . "\n";
    echo "Max Score: " . ($submission->max_score ?? 'NULL') . "\n";
    echo "Percentage: " . ($submission->percentage ?? 'NULL') . "\n";
    echo "Submitted At: {$submission->submitted_at}\n";
    echo "Has Answers: " . ($submission->answers ? 'Yes (' . count($submission->answers) . ' answers)' : 'No') . "\n";
    echo "Has Grading Details: " . ($submission->grading_details ? 'Yes (' . count($submission->grading_details) . ' details)' : 'No') . "\n";
}

echo "\n=== CHECKING ASSESSMENT 287 SPECIFICALLY ===\n";
$assessment = Assessment::with('questions')->find(287);
if ($assessment) {
    echo "Assessment Title: {$assessment->title}\n";
    echo "Questions Count: " . $assessment->questions->count() . "\n";
    echo "Total Points: " . $assessment->questions->sum('points') . "\n";
    
    echo "\nQuestions:\n";
    foreach ($assessment->questions as $question) {
        echo "- Q{$question->question_number}: {$question->points} points, Type: {$question->type}\n";
    }
}
