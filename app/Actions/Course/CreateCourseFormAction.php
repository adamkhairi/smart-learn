<?php

namespace App\Actions\Course;

use App\Models\Category;
use Illuminate\Support\Facades\Auth;

class CreateCourseFormAction
{
    public function execute(): array
    {
        // Ensure the user is authorized to create a course
        // This is handled in the controller with $this->authorize('create', Course::class)

        $categories = Category::all();

        return [
            'categories' => $categories,
        ];
    }
}
