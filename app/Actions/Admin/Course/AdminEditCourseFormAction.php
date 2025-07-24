<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use App\Models\Category;

class AdminEditCourseFormAction
{
    public function execute(Course $course): array
    {
        $course->load(['creator', 'enrolledUsers']);
        $categories = Category::all();

        return [
            'course' => $course,
            'categories' => $categories,
        ];
    }
}
