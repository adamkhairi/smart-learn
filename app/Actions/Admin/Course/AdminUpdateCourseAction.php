<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Enums\CourseLevel;

class AdminUpdateCourseAction
{
    public function execute(Request $request, Course $course): Course
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'created_by' => 'required|exists:users,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:draft,published,archived',
            'files' => 'nullable|array',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }

            $path = $request->file('image')->store('courses/images', 'public');
            $validated['image'] = $path;
        } else if ($request->input('image_removed')) {
            // If image was explicitly removed from the frontend
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
            }
            $validated['image'] = null;
        } else {
            // No new image uploaded, preserve existing one unless explicitly removed
            unset($validated['image']);
        }

        $course->update($validated);

        // Update enrollment if creator changed
        if ($course->created_by !== $validated['created_by']) {
            // Remove old creator enrollment
            $course->unenroll($course->created_by);
            // Add new creator enrollment
            $course->enroll($validated['created_by'], 'instructor');
        }

        return $course;
    }
}
