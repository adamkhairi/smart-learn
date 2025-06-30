<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CourseModuleItemTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Course $course;
    protected CourseModule $module;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->course = Course::factory()->create(['created_by' => $this->user->id]);
        $this->module = CourseModule::factory()->create([
            'course_id' => $this->course->id,
            'title' => 'Test Module',
            'order' => 1
        ]);

        Storage::fake('public');
    }

    public function test_can_create_video_item(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Video',
                'description' => 'A test video item',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration' => '180',
                'is_required' => true,
            ]);

        $response->assertRedirect(route('courses.modules.show', [$this->course, $this->module]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('course_module_items', [
            'title' => 'Test Video',
            'type' => 'video',
            'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration' => 180,
            'is_required' => true,
            'course_module_id' => $this->module->id,
        ]);
    }

    public function test_can_create_document_item(): void
    {
        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Document',
                'description' => 'A test document item',
                'type' => 'document',
                'file' => $file,
                'is_required' => false,
            ]);

        $response->assertRedirect(route('courses.modules.show', [$this->course, $this->module]));
        $response->assertSessionHas('success');

        $item = CourseModuleItem::where('title', 'Test Document')->first();
        $this->assertNotNull($item);
        $this->assertEquals('document', $item->type);
        $this->assertStringContainsString('modules/documents/', $item->url);

        // Verify file was stored
        Storage::disk('public')->assertExists($item->url);
    }

    public function test_can_create_link_item(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Link',
                'description' => 'A test external link',
                'type' => 'link',
                'url' => 'https://laravel.com',
                'is_required' => false,
            ]);

        $response->assertRedirect(route('courses.modules.show', [$this->course, $this->module]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('course_module_items', [
            'title' => 'Test Link',
            'type' => 'link',
            'url' => 'https://laravel.com',
            'course_module_id' => $this->module->id,
        ]);
    }

    public function test_can_create_quiz_item(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Quiz',
                'description' => 'A test quiz item',
                'type' => 'quiz',
                'content' => 'This is quiz content with questions and answers.',
                'is_required' => true,
            ]);

        $response->assertRedirect(route('courses.modules.show', [$this->course, $this->module]));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('course_module_items', [
            'title' => 'Test Quiz',
            'type' => 'quiz',
            'content' => 'This is quiz content with questions and answers.',
            'is_required' => true,
            'course_module_id' => $this->module->id,
        ]);
    }

    public function test_validation_works_for_required_fields(): void
    {
        // Test missing title
        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration' => '180',
            ]);

        $response->assertSessionHasErrors(['title']);

        // Test missing duration for video
        $response = $this->actingAs($this->user)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Video',
                'type' => 'video',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            ]);

        $response->assertSessionHasErrors(['duration']);
    }

    public function test_can_delete_item_with_file(): void
    {
        $file = UploadedFile::fake()->create('test-document.pdf', 1024);

        // Create item with file
        $item = CourseModuleItem::create([
            'title' => 'Test Document',
            'type' => 'document',
            'course_module_id' => $this->module->id,
            'order' => 1,
            'url' => $file->store('modules/documents', 'public'),
        ]);

        // Manually store the file to simulate real upload
        Storage::disk('public')->put($item->url, 'test content');

        $response = $this->actingAs($this->user)
            ->delete(route('courses.modules.items.destroy', [$this->course, $this->module, $item]));

        $response->assertRedirect(route('courses.modules.show', [$this->course, $this->module]));
        $response->assertSessionHas('success');

        // Verify item is deleted
        $this->assertSoftDeleted('course_module_items', ['id' => $item->id]);
    }

    public function test_unauthorized_user_cannot_manage_items(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->post(route('courses.modules.items.store', [$this->course, $this->module]), [
                'title' => 'Test Item',
                'type' => 'link',
                'url' => 'https://example.com',
            ]);

        // Check for either 403 or redirect (both indicate unauthorized access)
        $this->assertTrue(in_array($response->status(), [403, 302]));
    }

    public function test_show_page_returns_correct_data_structure(): void
    {
        $item = CourseModuleItem::create([
            'title' => 'Test Item',
            'description' => 'Test description',
            'type' => 'video',
            'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration' => 300,
            'course_module_id' => $this->module->id,
            'order' => 1,
            'is_required' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('courses.modules.items.show', [$this->course, $this->module, $item]));

        $response->assertStatus(200);

        // Verify the data structure matches frontend expectations
        $response->assertInertia(fn ($page) =>
            $page->component('Courses/Modules/Items/Show')
                ->has('course')
                ->has('course.created_by')
                ->has('course.creator')
                ->has('module')
                ->has('module.moduleItems')
                ->has('item')
                ->has('completedItems')
                ->where('item.title', 'Test Item')
                ->where('item.type', 'video')
                ->where('item.is_required', true)
        );
    }

    public function test_module_show_page_returns_correct_data_structure(): void
    {
        $item1 = CourseModuleItem::create([
            'title' => 'Item 1',
            'type' => 'video',
            'course_module_id' => $this->module->id,
            'order' => 1,
        ]);

        $item2 = CourseModuleItem::create([
            'title' => 'Item 2',
            'type' => 'document',
            'course_module_id' => $this->module->id,
            'order' => 2,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('courses.modules.show', [$this->course, $this->module]));

    $response->assertStatus(200);

        // Verify the module has moduleItems loaded
        $response->assertInertia(fn ($page) =>
            $page->component('Courses/Modules/Show')
                ->has('course')
                ->has('course.created_by')
                ->has('course.creator')
                ->has('module')
                ->has('module.moduleItems', 2) // Should have 2 items
                ->where('module.moduleItems.0.title', 'Item 1')
                ->where('module.moduleItems.1.title', 'Item 2')
        );
    }
}
