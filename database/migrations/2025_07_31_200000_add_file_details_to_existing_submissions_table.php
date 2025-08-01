<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Submission;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // Add this line

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::enableQueryLog(); // Enable query log

        // Populate existing submissions with file_path, original_filename, file_size, file_type
        // based on the first entry in the 'files' JSON column.
        // This is a one-time migration for existing data.
        $submissions = Submission::where(function ($query) {
                                     $query->whereNull('file_path')
                                           ->orWhere('file_path', '-'); // Include submissions where file_path is '-'
                                 })
                                 ->whereNotNull('files') // Ensure 'files' column is not null
                                 ->where('files', '!=', '[]') // Ensure 'files' column is not an empty JSON array
                                 ->get();

        Log::info('Starting migration to update existing submissions file details.', ['count' => $submissions->count()]);

        foreach ($submissions as $submission) {
            Log::info('Processing submission ID:' . $submission->id, [
                'raw_files_data' => $submission->getRawOriginal('files'), // Get raw JSON string
                'casted_files_data' => $submission->files, // Get casted array
                'current_file_path_in_db' => $submission->getRawOriginal('file_path') // Get raw file_path from DB
            ]);

            // Re-fetch submission to ensure it's fresh and not affected by previous operations
            $freshSubmission = Submission::find($submission->id);

            if (!$freshSubmission) {
                Log::warning('Submission not found after re-fetching, skipping.', ['submission_id' => $submission->id]);
                continue;
            }

            // Re-check condition on the fresh submission
            if ((is_null($freshSubmission->file_path) || $freshSubmission->file_path === '-') && is_array($freshSubmission->files) && !empty($freshSubmission->files)) {
                $firstFilePath = $freshSubmission->files[0];

                // Extract filename from path (e.g., /path/to/my_file.pdf -> my_file.pdf)
                $originalFilename = basename($firstFilePath);

                // Acknowledge that file_size and file_type cannot be accurately retrieved here
                // and are set to placeholders. For accurate data, files would need to be re-uploaded.
                $fileSize = 0; // Placeholder
                $fileType = 'application/octet-stream'; // Placeholder

                try {
                    $freshSubmission->file_path = $firstFilePath;
                    $freshSubmission->original_filename = $originalFilename;
                    $freshSubmission->file_size = $fileSize;
                    $freshSubmission->file_type = $fileType;
                    $updated = $freshSubmission->save();

                    if ($updated) {
                        Log::info('Successfully updated submission with file details.', [
                            'submission_id' => $freshSubmission->id,
                            'new_file_path' => $firstFilePath
                        ]);
                    } else {
                        Log::warning('Failed to save updated submission (save() returned false).', ['submission_id' => $freshSubmission->id]);
                    }
                } catch (\Exception $e) {
                    Log::error('Exception during submission update.', [
                        'submission_id' => $freshSubmission->id,
                        'error_message' => $e->getMessage(),
                        'stack_trace' => $e->getTraceAsString()
                    ]);
                }
            } else {
                Log::info('Skipping submission (file_path already set or no valid files to update).', ['submission_id' => $freshSubmission->id, 'current_file_path' => $freshSubmission->file_path, 'files_data' => $freshSubmission->files]);
            }
        }

        Log::info('Queries executed during migration:', DB::getQueryLog()); // Log executed queries
        DB::disableQueryLog(); // Disable query log
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a data migration. Reversing it is not strictly necessary for schema integrity
        // and attempting to drop columns that might not exist can cause issues.
        // If a reverse operation is needed, it would involve more complex data manipulation
        // or manual database intervention.
        Log::info('Skipping down method for add_file_details_to_existing_submissions_table.');
    }
};
