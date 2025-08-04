<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Submission;
use Illuminate\Support\Facades\Storage;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking submission ID 288 details...\n\n";

$submission = Submission::find(288);

if (!$submission) {
    echo "Submission not found!\n";
    exit(1);
}

echo "=== RAW DATABASE DATA ===\n";
echo "ID: {$submission->id}\n";
echo "Files (JSON): " . json_encode($submission->files) . "\n";
echo "File Path: " . ($submission->file_path ?: 'NULL') . "\n";
echo "Original Filename: " . ($submission->original_filename ?: 'NULL') . "\n";
echo "File Size: " . ($submission->file_size ?: 'NULL') . "\n";
echo "File Type: " . ($submission->file_type ?: 'NULL') . "\n";
echo "Created At: {$submission->created_at}\n";
echo "Updated At: {$submission->updated_at}\n\n";

echo "=== FILE STORAGE CHECK ===\n";
if ($submission->file_path) {
    // Check both possible storage paths
    $privatePath = 'private/' . $submission->file_path;
    $publicPath = $submission->file_path;
    
    echo "Checking private path: {$privatePath}\n";
    if (Storage::exists($privatePath)) {
        echo "✅ File found in private storage\n";
        $size = Storage::size($privatePath);
        echo "Actual file size: {$size} bytes\n";
    } else {
        echo "❌ File not found in private storage\n";
    }
    
    echo "Checking public path: {$publicPath}\n";
    if (Storage::exists($publicPath)) {
        echo "✅ File found in public storage\n";
        $size = Storage::size($publicPath);
        echo "Actual file size: {$size} bytes\n";
    } else {
        echo "❌ File not found in public storage\n";
    }
    
    // Check absolute path
    $absolutePath = storage_path('app/' . $submission->file_path);
    echo "Checking absolute path: {$absolutePath}\n";
    if (file_exists($absolutePath)) {
        echo "✅ File found at absolute path\n";
        $size = filesize($absolutePath);
        echo "Actual file size: {$size} bytes\n";
    } else {
        echo "❌ File not found at absolute path\n";
    }
} else {
    echo "No file_path to check\n";
}

echo "\n=== ANALYSIS ===\n";
if ($submission->file_size === null || $submission->file_size === 0) {
    echo "❌ ISSUE: file_size is NULL or 0 - this suggests the migration populated files but not file metadata\n";
}

if ($submission->files && is_array($submission->files) && !empty($submission->files)) {
    echo "✅ Files array is properly populated\n";
} else {
    echo "❌ ISSUE: Files array is empty or invalid\n";
}
