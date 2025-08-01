<?php

namespace App\Actions\CourseModuleItems;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\Lecture;
use App\Models\Assessment;
use App\Models\Assignment;
use App\Models\Question;
use App\Actions\Notification\CreateNotificationAction;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CreateCourseModuleItemAction
{
    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {}

    public function execute(Course $course, CourseModule $module, array $data): CourseModuleItem
    {
        return DB::transaction(function () use ($course, $module, $data) {
            $itemable = $this->createItemable($course, $module, $data);

            $moduleItem = CourseModuleItem::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'course_module_id' => $module->id,
                'itemable_id' => $itemable->id,
                'itemable_type' => get_class($itemable),
                'order' => $data['order'] ?? $module->moduleItems()->max('order') + 1,
                'is_required' => $data['is_required'] ?? false,
                'status' => $data['status'] ?? 'published',
            ]);

            // Send notifications to enrolled students about new content
            if ($data['status'] === 'published') {
                $enrolledStudents = $course->enrolledUsers()->where('pivot.enrolled_as', 'student')->get();
                
                foreach ($enrolledStudents as $student) {
                    $this->createNotificationAction->createNewContentNotification(
                        user: $student,
                        courseTitle: $course->name,
                        contentTitle: $data['title'],
                        contentType: $data['item_type'],
                        actionUrl: "/courses/{$course->id}/modules/{$module->id}/items/{$moduleItem->id}"
                    );
                }
            }

            return $moduleItem;
        });
    }

    private function createItemable(Course $course, CourseModule $module, array $data)
    {
        $userId = Auth::id();

        switch ($data['item_type']) {
            case 'lecture':
                $contentJson = null;
                if (!empty($data['content_json'])) {
                    $contentJson = is_string($data['content_json'])
                        ? json_decode($data['content_json'], true)
                        : $data['content_json'];
                }

                return Lecture::create([
                    'title' => $data['title'],
                    'description' => $data['description'] ?? null,
                    'video_url' => $data['video_url'] ?? null,
                    'duration' => $data['duration'] ?? null,
                    'content_json' => $contentJson,
                    'content_html' => $data['content_html'] ?? null,
                    'course_id' => $course->id,
                    'course_module_id' => $module->id,
                    'created_by' => $userId,
                    'is_published' => ($data['status'] ?? 'published') === 'published',
                ]);
            case 'assessment':
                $assessment = Assessment::create([
                    'title' => $data['assessment_title'] ?: $data['title'], // Auto-populate from generic title if empty
                    'type' => $data['assessment_type'] ?? 'Quiz',
                    'max_score' => $data['max_score'] ?? 100,
                    'course_id' => $course->id,
                    'created_by' => $userId,
                    'visibility' => ($data['status'] ?? 'published') === 'published' ? 'published' : 'unpublished',
                    'content_json' => $data['assessment_content_json'] ? json_decode($data['assessment_content_json'], true) : null,
                    'content_html' => $data['assessment_content_html'] ?? null,
                    'instructions' => $data['assessment_instructions_json'] ? json_decode($data['assessment_instructions_json'], true) : null,
                ]);

                // Create questions if provided
                $questions = [];
                if (!empty($data['questions'])) {
                    // If questions is a JSON string, decode it
                    if (is_string($data['questions'])) {
                        $questions = json_decode($data['questions'], true) ?? [];
                    } else {
                        $questions = $data['questions'];
                    }
                }

                if (!empty($questions)) {
                    foreach ($questions as $index => $questionData) {
                        Question::create([
                            'assessment_id' => $assessment->id,
                            'type' => $questionData['type'],
                            'question_number' => $index + 1,
                            'points' => $questionData['points'],
                            'question_text' => $questionData['question_text'],
                            'auto_graded' => $questionData['type'] === 'MCQ',
                            'choices' => $questionData['choices'] ?? null,
                            'answer' => $questionData['answer'] ?? null,

                            'text_match' => false,
                        ]);
                    }
                }

                return $assessment;
            case 'assignment':
                return Assignment::create([
                    'title' => $data['assignment_title'] ?: $data['title'], // Auto-populate from generic title if empty
                    'assignment_type' => $data['assignment_type'] ?? 'general',
                    'total_points' => $data['total_points'] ?? 100,
                    'course_id' => $course->id,
                    'created_by' => $userId,
                    'started_at' => $data['started_at'] ?? now(),
                    'expired_at' => $data['expired_at'] ?? null,
                    'visibility' => ($data['status'] ?? 'published') === 'published',
                    'content_json' => $data['assignment_content_json'] ? json_decode($data['assignment_content_json'], true) : null,
                    'content_html' => $data['assignment_content_html'] ?? null,
                    'instructions' => $data['assignment_instructions_json'] ? json_decode($data['assignment_instructions_json'], true) : null,
                    'rubric' => $data['assignment_rubric_json'] ? json_decode($data['assignment_rubric_json'], true) : null,
                ]);
            default:
                throw new Exception('Invalid item type specified.');
        }
    }
}
