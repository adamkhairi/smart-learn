<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollUserAction
{
    public function execute(Request $request, Course $course): void
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:student,instructor,admin',
        ]);

        $course->enroll($validated['user_id'], $validated['role'], Auth::user());
    }
}
