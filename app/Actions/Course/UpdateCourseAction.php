<?php

namespace App\Actions\Course;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Enums\CourseLevel;

class UpdateCourseAction
{
    public function execute(Request $request, Course $course): Course
    {
        Log::info('Request all data:', $request->all());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'background_color' => 'nullable|string|regex:/^#[0-9A-F]{6}$/i',
            'status' => 'required|in:published,archived,draft',
            'is_private' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'duration' => 'nullable|integer|min:0',
        ]);

        // Handle image update
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
                Log::info('Deleted old image: ' . $course->image);
            }

            $path = $request->file('image')->store('courses/images', 'public');
            $validated['image'] = $path;
            Log::info('New image uploaded: ' . $path);
        } elseif ($request->has('image_removed') && $request->boolean('image_removed')) {
            // User explicitly wants to remove the image
            if ($course->image) {
                Storage::disk('public')->delete($course->image);
                Log::info('Deleted old image due to explicit removal: ' . $course->image);
            }
            $validated['image'] = null; // Explicitly set to null for removal
            Log::info('Image explicitly removed, setting to null.');
        } else {
            // If no new image and not explicitly removed, keep the existing one
            unset($validated['image']);
            Log::info('No new image and not explicitly removed, keeping existing image.');
        }

        $course->update($validated);

        return $course;
    }
}
