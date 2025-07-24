<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Enums\CourseLevel;

class AdminStoreCourseAction
{
    public function execute(Request $request): Course
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'created_by' => 'required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:draft,published,archived',
            'files' => 'nullable|array',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        $course = new Course($validated);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('courses/images', 'public');
            $course->image = $path;
        }

        $course->save();

        // Auto-enroll the creator as instructor
        $course->enroll($validated['created_by'], 'instructor', Auth::user());

        return $course;
    }
}
