<?php

namespace App\Actions\Discussion;

use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Pagination\LengthAwarePaginator;

class ListDiscussionsAction
{
    public function execute(Course $course): LengthAwarePaginator
    {
        return $course->discussions()
            ->with('user')
            ->withCount('comments')
            ->latest()
            ->paginate(10);
    }
}
