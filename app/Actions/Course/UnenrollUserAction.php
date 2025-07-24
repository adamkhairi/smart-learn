<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\Request;

class UnenrollUserAction
{
    public function execute(Request $request, Course $course): void
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $course->unenroll($validated['user_id']);
    }
}
