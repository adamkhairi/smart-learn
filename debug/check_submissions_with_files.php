<?php

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Submission;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking submissions with files...\n\n";

// Get submissions that have files
$submissionsWithFiles = Submission::whereNotNull('files')
    ->where('files', '!=', '[]')
    ->where('files', '!=', 'null')
    ->get(['id', 'files', 'file_path', 'original_filename', 'file_size', 'file_type']);

echo "Submissions with files:\n";
foreach ($submissionsWithFiles as $submission) {
    echo "ID: {$submission->id}\n";
    $files = is_string($submission->files) ? json_decode($submission->files, true) : $submission->files;
    echo "Files JSON: " . json_encode($files) . "\n";
    echo "File Path: " . ($submission->file_path ?: 'NULL') . "\n";
    echo "Original Filename: " . ($submission->original_filename ?: 'NULL') . "\n";
    echo "File Size: " . ($submission->file_size ?: 'NULL') . "\n";
    echo "File Type: " . ($submission->file_type ?: 'NULL') . "\n";
    echo "==================\n";
}

echo "\nTotal submissions with files: " . $submissionsWithFiles->count() . "\n";

// Get all submissions without files
$submissionsWithoutFiles = Submission::where(function($query) {
    $query->whereNull('files')
          ->orWhere('files', '[]')
          ->orWhere('files', 'null')
          ->orWhere('files', '');
})->count();

echo "Total submissions without files: {$submissionsWithoutFiles}\n";

// Get template data from first submission with files
if ($submissionsWithFiles->count() > 0) {
    $templateSubmission = $submissionsWithFiles->first();
    echo "\n=== TEMPLATE DATA TO USE ===\n";
    echo "Template Submission ID: {$templateSubmission->id}\n";
    $templateFiles = is_string($templateSubmission->files) ? json_decode($templateSubmission->files, true) : $templateSubmission->files;
    echo "Template Files: " . json_encode($templateFiles) . "\n";
    echo "Template File Path: " . ($templateSubmission->file_path ?: 'NULL') . "\n";
    echo "Template Original Filename: " . ($templateSubmission->original_filename ?: 'NULL') . "\n";
    echo "Template File Size: " . ($templateSubmission->file_size ?: 'NULL') . "\n";
    echo "Template File Type: " . ($templateSubmission->file_type ?: 'NULL') . "\n";
}
