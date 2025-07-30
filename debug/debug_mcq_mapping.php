<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\Assessment;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== MCQ MAPPING ANALYSIS ===\n";

$assessment = Assessment::with('questions')->find(287);

if ($assessment) {
    echo "Assessment: {$assessment->title}\n\n";
    
    foreach ($assessment->questions as $question) {
        if ($question->type === 'MCQ') {
            echo "MCQ Question {$question->question_number} (ID: {$question->id}):\n";
            echo "  Question: " . substr($question->question_text, 0, 50) . "...\n";
            echo "  Choices: " . json_encode($question->choices, JSON_PRETTY_PRINT) . "\n";
            echo "  Correct Answer (from question.answer): " . json_encode($question->answer) . "\n";
            
            // Check if the correct answer is a key or a value
            if ($question->choices) {
                $isKey = array_key_exists($question->answer, $question->choices);
                $isValue = in_array($question->answer, $question->choices);
                
                echo "  Is correct answer a key in choices? " . ($isKey ? 'YES' : 'NO') . "\n";
                echo "  Is correct answer a value in choices? " . ($isValue ? 'YES' : 'NO') . "\n";
                
                if ($isKey) {
                    echo "  Choice text for key '{$question->answer}': " . $question->choices[$question->answer] . "\n";
                }
                
                if ($isValue) {
                    $key = array_search($question->answer, $question->choices);
                    echo "  Key for value '{$question->answer}': " . $key . "\n";
                }
            }
            echo "\n";
        }
    }
} else {
    echo "Assessment not found!\n";
}
