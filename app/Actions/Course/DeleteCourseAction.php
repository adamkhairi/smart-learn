<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Support\Facades\Storage;

class DeleteCourseAction
{
    public function execute(Course $course): void
    {
        // Delete course image if exists
        if ($course->image) {
            Storage::disk('public')->delete($course->image);
        }

        $course->delete();
    }
}
