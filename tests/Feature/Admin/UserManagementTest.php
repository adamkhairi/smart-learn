<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $instructor;
    private User $student;
    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->instructor = User::factory()->create(['role' => 'instructor']);
        $this->student = User::factory()->create(['role' => 'student']);
        $this->course = Course::factory()->create(['created_by' => $this->admin->id]);
    }

    public function test_admin_can_view_users_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Users/Index'));
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $response = $this->actingAs($this->instructor)->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user(): void
    {
        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'username' => 'newuser',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
            'mobile' => '1234567890',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.users.store'), $userData);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'role' => 'student',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'username' => 'updateduser',
            'role' => 'instructor',
            'mobile' => '0987654321',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.users.update', $this->student->id), $updateData);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $this->student->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'instructor',
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->student->id));

        $response->assertRedirect(route('admin.users.index'));
        $this->assertSoftDeleted('users', ['id' => $this->student->id]);
    }

    public function test_admin_cannot_delete_own_account(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.users.destroy', $this->admin->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_toggle_user_active_status(): void
    {
        $response = $this->actingAs($this->admin)->patch(route('admin.users.toggle-active', $this->student->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $this->student->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_assign_user_to_course(): void
    {
        $assignmentData = [
            'course_id' => $this->course->id,
            'role' => 'instructor',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.users.assign-course', $this->student->id), $assignmentData);

        $response->assertRedirect();
        $this->assertDatabaseHas('course_user_enrollments', [
            'user_id' => $this->student->id,
            'course_id' => $this->course->id,
            'enrolled_as' => 'instructor',
        ]);
    }

    public function test_admin_can_remove_user_from_course(): void
    {
        // First assign user to course
        $this->student->assignToCourse($this->course, 'student');

        $response = $this->actingAs($this->admin)->delete(route('admin.users.remove-course', $this->student->id), [
            'course_id' => $this->course->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('course_user_enrollments', [
            'user_id' => $this->student->id,
            'course_id' => $this->course->id,
        ]);
    }

    public function test_admin_can_update_user_course_role(): void
    {
        // First assign user to course as student
        $this->student->assignToCourse($this->course, 'student');

        $updateData = [
            'course_id' => $this->course->id,
            'role' => 'instructor',
        ];

        $response = $this->actingAs($this->admin)->patch(route('admin.users.update-course-role', $this->student->id), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('course_user_enrollments', [
            'user_id' => $this->student->id,
            'course_id' => $this->course->id,
            'enrolled_as' => 'instructor',
        ]);
    }

    public function test_admin_can_view_user_statistics(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.stats'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Users/Stats'));
    }

    public function test_users_can_be_filtered_by_role(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index', ['role' => 'instructor']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Users/Index')
                 ->has('users.data')
                 ->where('filters.role', 'instructor')
        );
    }

    public function test_users_can_be_filtered_by_status(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index', ['status' => 'active']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Users/Index')
                 ->has('users.data')
                 ->where('filters.status', 'active')
        );
    }

    public function test_users_can_be_searched(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.users.index', ['search' => $this->student->name]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Users/Index')
                 ->has('users.data')
                 ->where('filters.search', $this->student->name)
        );
    }
}
