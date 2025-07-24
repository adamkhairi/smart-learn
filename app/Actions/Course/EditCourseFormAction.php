<?php

namespace App\Actions\Course;

use App\Models\Course;
use App\Models\Category;

class EditCourseFormAction
{
    public function execute(Course $course): array
    {
        // Authorization is handled in the controller with $this->authorize('update', $course)

        $categories = Category::all();

        return [
            'course' => $course,
            'categories' => $categories,
        ];
    }
}
