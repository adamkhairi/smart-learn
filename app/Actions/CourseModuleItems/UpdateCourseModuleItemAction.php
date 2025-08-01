<?php

namespace App\Actions\CourseModuleItems;

use App\Models\CourseModuleItem;
use App\Models\Question;
use Exception;
use Illuminate\Support\Facades\DB;
use App\Models\Lecture;
use App\Models\Assessment;
use App\Models\Assignment;

class UpdateCourseModuleItemAction
{
    public function execute(CourseModuleItem $item, array $data): CourseModuleItem
    {
        return DB::transaction(function () use ($item, $data) {
            $this->updateItemable($item, $data);

            $item->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'is_required' => $data['is_required'] ?? false,
                'status' => $data['status'] ?? 'published',
            ]);

            return $item;
        });
    }

    private function updateItemable(CourseModuleItem $item, array $data): void
    {
        if (!$item->itemable) {
            return;
        }

        switch ($data['item_type']) {
            case 'lecture':
                $contentJson = null;
                if (!empty($data['content_json'])) {
                    $contentJson = is_string($data['content_json'])
                        ? json_decode($data['content_json'], true)
                        : $data['content_json'];
                }

                $item->itemable()->update([
                    'title' => $data['title'],
                    'description' => $data['description'] ?? null,
                    'video_url' => $data['video_url'] ?? null,
                    'duration' => $data['duration'] ?? null,
                    'content_json' => $contentJson,
                    'content_html' => $data['content_html'] ?? null,
                    'is_published' => ($data['status'] ?? 'published') === 'published',
                ]);
                break;
            case 'assessment':
                $item->itemable()->update([
                    'title' => $data['assessment_title'],
                    'type' => $data['assessment_type'] ?? 'Quiz',
                    'max_score' => $data['max_score'] ?? 100,
                    'visibility' => ($data['status'] ?? 'published') === 'published' ? 'published' : 'unpublished',
                    'content_json' => $data['assessment_content_json'] ? json_decode($data['assessment_content_json'], true) : null,
                    'content_html' => $data['assessment_content_html'] ?? null,
                    'instructions' => $data['assessment_instructions_json'] ? json_decode($data['assessment_instructions_json'], true) : null,
                ]);

                // Update questions if provided
                if (isset($data['questions'])) {
                    \Log::info('Questions data received:', [
                        'type' => gettype($data['questions']),
                        'value' => $data['questions']
                    ]);
                    $this->updateAssessmentQuestions($item->itemable, $data['questions']);
                }
                break;
            case 'assignment':
                $item->itemable()->update([
                    'title' => $data['assignment_title'],
                    'assignment_type' => $data['assignment_type'] ?? 'general',
                    'total_points' => $data['total_points'] ?? 100,
                    'started_at' => $data['started_at'] ?? now(),
                    'expired_at' => $data['expired_at'] ?? null,
                    'visibility' => ($data['status'] ?? 'published') === 'published',
                    'content_json' => $data['assignment_content_json'] ? json_decode($data['assignment_content_json'], true) : null,
                    'content_html' => $data['assignment_content_html'] ?? null,
                    'instructions' => $data['assignment_instructions_json'] ? json_decode($data['assignment_instructions_json'], true) : null,
                    'rubric' => $data['assignment_rubric_json'] ? json_decode($data['assignment_rubric_json'], true) : null,
                ]);
                break;
            default:
                throw new Exception('Invalid item type specified for update.');
        }
    }

    private function updateAssessmentQuestions(Assessment $assessment, $questionsData): void
    {
        $existingQuestionIds = $assessment->questions()->pluck('id')->toArray();
        $updatedQuestionIds = [];

        // Handle both string and array inputs
        $questions = [];
        if (is_string($questionsData)) {
            $questions = json_decode($questionsData, true);
        } elseif (is_array($questionsData)) {
            $questions = $questionsData;
        }

        if (!is_array($questions)) {
            return;
        }

        foreach ($questions as $index => $questionData) {
            $questionId = $questionData['id'] ?? null;

            if ($questionId && in_array($questionId, $existingQuestionIds)) {
                // Update existing question
                Question::where('id', $questionId)->update([
                    'type' => $questionData['type'],
                    'question_number' => $index + 1,
                    'points' => $questionData['points'],
                    'question_text' => $questionData['question_text'],
                    'auto_graded' => $questionData['type'] === 'MCQ',
                    'choices' => $questionData['choices'] ?? null,
                    'answer' => $questionData['answer'] ?? null,

                    'text_match' => false,
                ]);
                $updatedQuestionIds[] = $questionId;
            } else {
                // Create new question
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

        // Delete questions that were not included in the updated data
        $questionsToDelete = array_diff($existingQuestionIds, $updatedQuestionIds);
        if (!empty($questionsToDelete)) {
            Question::whereIn('id', $questionsToDelete)->delete();
        }
    }
}
