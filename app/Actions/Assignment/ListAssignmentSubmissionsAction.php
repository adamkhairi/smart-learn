<?php

namespace App\Actions\Assignment;

use App\Models\Assignment;
use Illuminate\Database\Eloquent\Collection;

class ListAssignmentSubmissionsAction
{
    public function execute(Assignment $assignment): Collection
    {
        return $assignment->submissions()->with(['user', 'grade'])->get();
    }
}
