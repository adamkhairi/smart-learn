<?php

namespace App\Actions\Admin\Course;

use App\Models\Category;

class AdminCreateCourseFormAction
{
    public function execute(): array
    {
        $categories = Category::all();

        return [
            'categories' => $categories,
        ];
    }
}
