<?php

namespace App\Actions\Assignment;

use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmitAssignmentAction
{
    public function execute(Assignment $assignment, UploadedFile $file): Submission
    {
        if (!$assignment->canAcceptSubmissions()) {
            throw new \Exception('This assignment is not accepting submissions.');
        }

        $existingSubmission = $assignment->submissions()
            ->where('user_id', Auth::id())
            ->first();

        if ($existingSubmission) {
            throw new \Exception('You have already submitted this assignment.');
        }

        $path = $file->store('submissions', 'public');

        return DB::transaction(function () use ($assignment, $path) {
            if (!$assignment->canAcceptSubmissions()) {
                throw new \Exception('Assignment submission deadline has passed.');
            }

            return Submission::create([
                'assignment_id' => $assignment->id,
                'course_id' => $assignment->course_id,
                'user_id' => Auth::id(),
                'files' => [$path],
                'submitted_at' => now(),
                'auto_grading_status' => 'unGraded',
                'plagiarism_status' => 'unCalculated',
            ]);
        });
    }
}
