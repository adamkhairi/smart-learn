<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Submission;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::enableQueryLog();

        // Get template data from first submission that has files
        $templateSubmission = Submission::whereNotNull('files')
            ->whereRaw('jsonb_array_length(files) > 0') // Check for non-empty JSON array
            ->first();

        if (!$templateSubmission) {
            Log::warning('No template submission with files found. Skipping migration.');
            return;
        }

        Log::info('Using template submission for file data', [
            'template_id' => $templateSubmission->id,
            'template_files' => $templateSubmission->files,
            'template_file_path' => $templateSubmission->file_path,
            'template_original_filename' => $templateSubmission->original_filename,
            'template_file_size' => $templateSubmission->file_size,
            'template_file_type' => $templateSubmission->file_type,
        ]);

        // Get all submissions that don't have files
        $submissionsToUpdate = Submission::where(function ($query) {
            $query->whereNull('files')
                  ->orWhereRaw('jsonb_array_length(files) = 0'); // Check for empty JSON array
        })->get();

        Log::info('Found submissions to update', ['count' => $submissionsToUpdate->count()]);

        $updateCount = 0;
        foreach ($submissionsToUpdate as $submission) {
            try {
                $submission->update([
                    'files' => $templateSubmission->files,
                    'file_path' => $templateSubmission->file_path,
                    'original_filename' => $templateSubmission->original_filename,
                    'file_size' => $templateSubmission->file_size,
                    'file_type' => $templateSubmission->file_type,
                ]);

                $updateCount++;
                Log::info('Updated submission', ['id' => $submission->id]);
            } catch (\Exception $e) {
                Log::error('Failed to update submission', [
                    'id' => $submission->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        Log::info('Migration completed', [
            'template_submission_id' => $templateSubmission->id,
            'submissions_updated' => $updateCount,
            'total_submissions_processed' => $submissionsToUpdate->count()
        ]);

        echo "Migration completed successfully!\n";
        echo "Template submission ID: {$templateSubmission->id}\n";
        echo "Submissions updated: {$updateCount}\n";
        echo "Total submissions processed: {$submissionsToUpdate->count()}\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset all submissions that were updated to have null file data
        // This is a destructive operation, so we'll just log it
        Log::info('Reversing populate_all_submissions_with_files migration - this would reset file data to null');
        
        // Uncomment below if you really want to reverse (destructive!)
        /*
        Submission::whereNotNull('files')->update([
            'files' => null,
            'file_path' => null,
            'original_filename' => null,
            'file_size' => null,
            'file_type' => null,
        ]);
        */
    }
};
