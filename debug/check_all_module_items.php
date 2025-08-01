<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Checking All Module Items with Assignment Submissions ===\n\n";

// Get all course module items that are assignments
$assignmentItems = App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assignment')
    ->with(['itemable', 'courseModule'])
    ->get();

echo "Found " . $assignmentItems->count() . " assignment module items\n\n";

$totalSubmissions = 0;
$submissionsWithFiles = 0;
$submissionsWithoutFiles = 0;
$issuesFound = [];

foreach ($assignmentItems as $item) {
    $assignment = $item->itemable;
    if (!$assignment) {
        echo "⚠️  Item {$item->id}: Assignment not found\n";
        continue;
    }
    
    echo "📋 Item {$item->id}: {$assignment->title}\n";
    echo "   Module: {$item->courseModule->title}\n";
    echo "   Assignment ID: {$assignment->id}\n";
    echo "   Assignment Type: " . ($assignment->assignment_type ? $assignment->assignment_type->value : 'NULL') . "\n";
    
    // Get submissions for this assignment
    $submissions = App\Models\Submission::where('assignment_id', $assignment->id)->get();
    echo "   Submissions: " . $submissions->count() . "\n";
    
    if ($submissions->count() > 0) {
        foreach ($submissions as $submission) {
            $totalSubmissions++;
            
            echo "   └─ Submission {$submission->id} (User {$submission->user_id}):\n";
            echo "      Submitted: " . ($submission->submitted_at ?? 'NULL') . "\n";
            echo "      Finished: " . ($submission->finished ? 'true' : 'false') . "\n";
            
            // Check file data
            $hasFiles = false;
            $fileInfo = [];
            
            // Check files array
            if ($submission->files && is_array($submission->files) && count($submission->files) > 0) {
                $hasFiles = true;
                $fileInfo[] = "files array: " . count($submission->files) . " files";
                $submissionsWithFiles++;
            }
            
            // Check individual file fields
            if ($submission->file_path) {
                if (!$hasFiles) {
                    $hasFiles = true;
                    $submissionsWithFiles++;
                }
                $fileInfo[] = "file_path: " . $submission->file_path;
            }
            
            if ($submission->original_filename) {
                $fileInfo[] = "original_filename: " . $submission->original_filename;
            }
            
            if (!$hasFiles) {
                $submissionsWithoutFiles++;
                echo "      Files: ❌ No files\n";
            } else {
                echo "      Files: ✅ " . implode(', ', $fileInfo) . "\n";
            }
            
            // Check for potential issues
            if ($submission->file_path && (!$submission->files || !is_array($submission->files))) {
                $issuesFound[] = [
                    'type' => 'inconsistent_file_storage',
                    'item_id' => $item->id,
                    'submission_id' => $submission->id,
                    'description' => 'Has file_path but files array is NULL/empty'
                ];
            }
            
            if ($submission->files && is_array($submission->files) && !$submission->file_path) {
                // This is the new format, which is fine
            }
        }
    }
    
    echo "\n";
}

echo "=== Summary ===\n";
echo "Total assignment module items: " . $assignmentItems->count() . "\n";
echo "Total submissions: $totalSubmissions\n";
echo "Submissions with files: $submissionsWithFiles\n";
echo "Submissions without files: $submissionsWithoutFiles\n";
echo "Issues found: " . count($issuesFound) . "\n\n";

if (count($issuesFound) > 0) {
    echo "=== Issues Found ===\n";
    foreach ($issuesFound as $issue) {
        echo "🔧 {$issue['type']}: Item {$issue['item_id']}, Submission {$issue['submission_id']}\n";
        echo "   Description: {$issue['description']}\n";
    }
    echo "\n";
}

// Check for any assignments that might need file migration
echo "=== Checking for Legacy File Storage ===\n";
$legacySubmissions = App\Models\Submission::whereNotNull('file_path')
    ->whereNull('files')
    ->get();

echo "Found " . $legacySubmissions->count() . " submissions with legacy file storage\n";

if ($legacySubmissions->count() > 0) {
    echo "These submissions need migration:\n";
    foreach ($legacySubmissions as $sub) {
        echo "  - Submission {$sub->id}: {$sub->file_path}\n";
    }
}

echo "\nDone!\n";
