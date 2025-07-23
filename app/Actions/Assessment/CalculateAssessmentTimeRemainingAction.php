<?php

namespace App\Actions\Assessment;

use App\Models\Assessment;
use App\Models\Submission;

class CalculateAssessmentTimeRemainingAction
{
    public function execute(Assessment $assessment, Submission $submission): ?int
    {
        if (!$assessment->time_limit) {
            return null;
        }

        $startTime = $submission->created_at;
        $timeLimit = $assessment->time_limit * 60; // Convert to seconds
        $elapsed = now()->diffInSeconds($startTime);

        return max(0, $timeLimit - $elapsed);
    }
} 