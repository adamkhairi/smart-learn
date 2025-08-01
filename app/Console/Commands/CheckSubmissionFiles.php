<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Submission;

class CheckSubmissionFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-submission-files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks file-related attributes for submissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking submission file details...');

        $submissions = Submission::with(['user', 'assignment'])
                                 ->limit(60) // Increased limit to capture more submissions
                                 ->orderByDesc('created_at')
                                 ->get();

        if ($submissions->isEmpty()) {
            $this->warn('No submissions found.');
            return;
        }

        $headers = ['ID', 'Student', 'Assignment', 'File Path', 'Original Filename', 'File Size', 'File Type', 'Files (JSON)'];
        $data = [];

        foreach ($submissions as $submission) {
            $data[] = [
                $submission->id,
                $submission->user->name ?? 'N/A',
                $submission->assignment->title ?? 'N/A',
                $submission->file_path ?? '-',
                $submission->original_filename ?? '-',
                $submission->file_size ?? '-',
                $submission->file_type ?? '-',
                json_encode($submission->files) ?? 'null', // Explicitly show 'null' if files is null
            ];
        }

        $this->table($headers, $data);

        $this->info('Check complete.');
    }
}
