<?php

namespace App\Actions\Assignment;

use App\Models\Submission;
use Illuminate\Support\Facades\Auth;

class GradeSubmissionAction
{
    public function execute(Submission $submission, array $data): bool
    {
        return $submission->update([
            'score' => $data['score'],
            'feedback' => $data['feedback'],
            'graded_at' => now(),
            'graded_by' => Auth::id(),
            'auto_grading_status' => 'Graded',
        ]);
    }
}
