<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_enrolled_user_can_access_private_course()
    {
        // Create a course creator
        $creator = User::factory()->create(['role' => 'instructor']);

        // Create a student
        $student = User::factory()->create(['role' => 'student']);

        // Create a private course
        $course = Course::factory()->create([
            'created_by' => $creator->id,
            'status' => 'published',
            'is_private' => true,
        ]);

        // Enroll the student in the course
        $course->enroll($student->id, 'student', $creator);

        // Act as the student and try to access the course
        $response = $this->actingAs($student)->get(route('courses.show', $course));

        // Assert that the student can access the private course
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Courses/Show'));
    }

    public function test_non_enrolled_user_cannot_access_private_course()
    {
        // Create a course creator
        $creator = User::factory()->create(['role' => 'instructor']);

        // Create a student
        $student = User::factory()->create(['role' => 'student']);

        // Create a private course
        $course = Course::factory()->create([
            'created_by' => $creator->id,
            'status' => 'published',
            'is_private' => true,
        ]);

        // Act as the student and try to access the course (without being enrolled)
        $response = $this->actingAs($student)->get(route('courses.show', $course));

        // Assert that the student cannot access the private course
        $response->assertStatus(403);
    }

    public function test_course_creator_can_access_private_course()
    {
        // Create a course creator
        $creator = User::factory()->create(['role' => 'instructor']);

        // Create a private course
        $course = Course::factory()->create([
            'created_by' => $creator->id,
            'status' => 'published',
            'is_private' => true,
        ]);

        // Act as the creator and try to access the course
        $response = $this->actingAs($creator)->get(route('courses.show', $course));

        // Assert that the creator can access the private course
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Courses/Show'));
    }

    public function test_admin_can_access_private_course()
    {
        // Create an admin
        $admin = User::factory()->create(['role' => 'admin']);

        // Create a course creator
        $creator = User::factory()->create(['role' => 'instructor']);

        // Create a private course
        $course = Course::factory()->create([
            'created_by' => $creator->id,
            'status' => 'published',
            'is_private' => true,
        ]);

        // Act as the admin and try to access the course
        $response = $this->actingAs($admin)->get(route('courses.show', $course));

        // Assert that the admin can access the private course
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Courses/Show'));
    }
}
