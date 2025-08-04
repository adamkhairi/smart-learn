<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Submission;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== FIXING FILE METADATA FOR SUBMISSIONS ===\n\n";

// Get all submissions that have files but missing file_size
$submissionsToFix = Submission::whereNotNull('files')
    ->where('files', '!=', '[]')
    ->where('files', '!=', 'null')
    ->whereNull('file_size')
    ->get();

echo "Found {$submissionsToFix->count()} submissions with missing file_size\n\n";

$fixedCount = 0;
$notFoundCount = 0;

foreach ($submissionsToFix as $submission) {
    echo "Processing submission ID: {$submission->id}\n";
    
    if ($submission->file_path) {
        // Try different storage paths
        $possiblePaths = [
            storage_path('app/' . $submission->file_path),
            storage_path('app/private/' . $submission->file_path),
            storage_path('app/public/' . $submission->file_path),
        ];
        
        $fileFound = false;
        $actualSize = 0;
        $actualPath = '';
        
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $fileFound = true;
                $actualSize = filesize($path);
                $actualPath = $path;
                echo "  ✅ File found at: {$path}\n";
                echo "  📏 File size: {$actualSize} bytes\n";
                break;
            }
        }
        
        if ($fileFound) {
            // Update the submission with correct file_size
            $submission->update(['file_size' => $actualSize]);
            echo "  ✅ Updated file_size to {$actualSize}\n";
            $fixedCount++;
        } else {
            echo "  ❌ File not found at any expected location\n";
            $notFoundCount++;
            
            // For files that don't exist, let's set a reasonable default size
            // based on the filename or set to 0
            $submission->update(['file_size' => 0]);
            echo "  ⚠️  Set file_size to 0 (file not found)\n";
        }
    } else {
        echo "  ❌ No file_path found\n";
        $notFoundCount++;
    }
    
    echo "\n";
}

echo "=== SUMMARY ===\n";
echo "Total submissions processed: {$submissionsToFix->count()}\n";
echo "Successfully fixed: {$fixedCount}\n";
echo "Files not found: {$notFoundCount}\n";

// Now let's create a sample file for testing if needed
echo "\n=== CREATING SAMPLE TEST FILE ===\n";
$testContent = "This is a test file for assignment submission.\nCreated for testing purposes.\nFile size validation test.";
$testFileName = 'test-submission-' . time() . '.txt';
$testPath = 'assignments/test/submissions/' . $testFileName;

Storage::put($testPath, $testContent);
$testSize = Storage::size($testPath);

echo "Created test file: {$testPath}\n";
echo "Test file size: {$testSize} bytes\n";
echo "This can be used for testing new submissions.\n";

echo "\n🎉 File metadata fix complete!\n";
