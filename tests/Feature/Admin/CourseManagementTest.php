<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourseManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $instructor;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->instructor = User::factory()->create(['role' => 'instructor']);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    /** @test */
    public function admin_can_view_course_management_index()
    {
        $courses = Course::factory(5)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Index')
            ->has('courses.data', 5)
            ->has('creators')
            ->has('filters')
        );
    }

    /** @test */
    public function admin_can_search_courses()
    {
        Course::factory()->create(['name' => 'PHP Programming']);
        Course::factory()->create(['name' => 'JavaScript Basics']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.index', ['search' => 'PHP']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Index')
            ->has('courses.data', 1)
            ->where('filters.search', 'PHP')
        );
    }

    /** @test */
    public function admin_can_filter_courses_by_status()
    {
        Course::factory()->create(['status' => 'published']);
        Course::factory()->create(['status' => 'draft']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.index', ['status' => 'published']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Index')
            ->has('courses.data', 1)
            ->where('filters.status', 'published')
        );
    }

    /** @test */
    public function admin_can_filter_courses_by_creator()
    {
        $course1 = Course::factory()->create(['created_by' => $this->instructor->id]);
        $course2 = Course::factory()->create(['created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.index', ['creator' => $this->instructor->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Index')
            ->has('courses.data', 1)
            ->where('filters.creator', (string) $this->instructor->id)
        );
    }

    /** @test */
    public function admin_can_view_course_creation_form()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Create')
            ->has('instructors')
        );
    }

    /** @test */
    public function admin_can_create_course()
    {
        Storage::fake('public');

        $courseData = [
            'name' => 'Advanced PHP Programming',
            'description' => 'Learn advanced PHP concepts',
            'created_by' => $this->instructor->id,
            'status' => 'published',
            'background_color' => '#3B82F6',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.store'), $courseData);

        $response->assertRedirect(route('admin.courses.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'name' => 'Advanced PHP Programming',
            'description' => 'Learn advanced PHP concepts',
            'created_by' => $this->instructor->id,
            'status' => 'published',
        ]);

        // Check that creator is auto-enrolled as instructor
        $course = Course::where('name', 'Advanced PHP Programming')->first();
        $this->assertTrue($course->isInstructor($this->instructor->id));
    }

    /** @test */
    public function admin_can_create_course_with_image()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('course.jpg');

        $courseData = [
            'name' => 'Course with Image',
            'description' => 'Course description',
            'created_by' => $this->instructor->id,
            'status' => 'published',
            'background_color' => '#3B82F6',
            'image' => $file,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.store'), $courseData);

        $response->assertRedirect(route('admin.courses.index'));

        $course = Course::where('name', 'Course with Image')->first();
        $this->assertNotNull($course->image);
        Storage::disk('public')->assertExists($course->image);
    }

    /** @test */
    public function admin_can_view_course_details()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.show', $course));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Show')
            ->has('course')
            ->has('stats')
            ->has('recentActivity')
        );
    }

    /** @test */
    public function admin_can_view_course_edit_form()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.edit', $course));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Edit')
            ->has('course')
            ->has('instructors')
        );
    }

    /** @test */
    public function admin_can_update_course()
    {
        $course = Course::factory()->create([
            'name' => 'Old Course Name',
            'status' => 'draft',
        ]);

        $updateData = [
            'name' => 'Updated Course Name',
            'description' => 'Updated description',
            'created_by' => $this->instructor->id,
            'status' => 'published',
            'background_color' => '#EF4444',
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.courses.update', $course), $updateData);

        $response->assertRedirect(route('admin.courses.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'name' => 'Updated Course Name',
            'description' => 'Updated description',
            'status' => 'published',
        ]);
    }

    /** @test */
    public function admin_can_delete_course()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.courses.destroy', $course));

        $response->assertRedirect(route('admin.courses.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    /** @test */
    public function admin_can_toggle_course_status()
    {
        $course = Course::factory()->create(['status' => 'draft']);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.courses.toggle-status', $course));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => 'published',
        ]);
    }

    /** @test */
    public function admin_can_view_course_statistics()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.stats', $course));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'stats' => [
                'total_students',
                'total_instructors',
                'total_modules',
                'total_assignments',
                'enrollment_rate',
                'completion_rate',
            ],
            'recentActivity',
        ]);
    }

    /** @test */
    public function admin_can_view_course_enrollments()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.enrollments', $course));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Enrollments')
            ->has('course')
            ->has('enrolledUsers')
            ->has('availableUsers')
        );
    }

    /** @test */
    public function admin_can_enroll_users_in_course()
    {
        $course = Course::factory()->create();
        $students = User::factory(3)->student()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.enroll-users', $course), [
                'user_ids' => $students->pluck('id')->toArray(),
                'role' => 'student',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        foreach ($students as $student) {
            $this->assertTrue($course->isStudent($student->id));
        }
    }

    /** @test */
    public function admin_can_unenroll_users_from_course()
    {
        $course = Course::factory()->create();
        $students = User::factory(3)->student()->create();

        // Enroll students first
        foreach ($students as $student) {
            $course->enroll($student->id, 'student');
        }

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.courses.unenroll-users', $course), [
                'user_ids' => $students->pluck('id')->toArray(),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        foreach ($students as $student) {
            $this->assertFalse($course->isStudent($student->id));
        }
    }

    /** @test */
    public function admin_can_view_course_analytics()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.courses.analytics', $course));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Courses/Analytics')
            ->has('course')
            ->has('stats')
            ->has('recentActivity')
            ->has('enrollmentTrends')
        );
    }

    /** @test */
    public function non_admin_users_cannot_access_course_management()
    {
        $course = Course::factory()->create();

        $routes = [
            route('admin.courses.index'),
            route('admin.courses.create'),
            route('admin.courses.store'),
            route('admin.courses.show', $course),
            route('admin.courses.edit', $course),
            route('admin.courses.update', $course),
            route('admin.courses.destroy', $course),
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($this->instructor)->get($route);
            $response->assertStatus(403);
        }
    }

    /** @test */
    public function course_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.store'), []);

        $response->assertSessionHasErrors(['name', 'created_by', 'status']);
    }

    /** @test */
    public function course_update_validates_required_fields()
    {
        $course = Course::factory()->create();

        $response = $this->actingAs($this->admin)
            ->put(route('admin.courses.update', $course), []);

        $response->assertSessionHasErrors(['name', 'created_by', 'status']);
    }

    /** @test */
    public function course_image_validation_works()
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.store'), [
                'name' => 'Test Course',
                'created_by' => $this->instructor->id,
                'status' => 'published',
                'image' => $file,
            ]);

        $response->assertSessionHasErrors(['image']);
    }

    /** @test */
    public function background_color_validation_works()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.courses.store'), [
                'name' => 'Test Course',
                'created_by' => $this->instructor->id,
                'status' => 'published',
                'background_color' => 'invalid-color',
            ]);

        $response->assertSessionHasErrors(['background_color']);
    }
}
