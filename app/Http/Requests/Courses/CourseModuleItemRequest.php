<?php

namespace App\Http\Requests\Courses;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseModuleItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in the controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'item_type' => ['required', Rule::in(['lecture', 'assessment', 'assignment'])],
            'order' => 'nullable|integer|min:1',
            'is_required' => 'boolean',
            'status' => ['nullable', Rule::in(['draft', 'published'])],
        ];

        // Type-specific validation rules for the content
        switch (request()->input('item_type')) {
            case 'lecture':
                $rules['video_url'] = 'nullable|url|max:500';
                $rules['duration'] = 'nullable|integer|min:0|max:86400'; // Max 24 hours
                $rules['content'] = 'nullable|string|max:50000';
                $rules['content_json'] = 'nullable|string|max:100000';
                $rules['content_html'] = 'nullable|string|max:100000';
                break;

            case 'assessment':
                $rules['assessment_title'] = 'required|string|min:3|max:255';
                $rules['max_score'] = 'nullable|integer|min:1|max:1000';
                $rules['assessment_type'] = ['nullable', Rule::in(['quiz', 'exam', 'project'])];
                $rules['questions_type'] = ['nullable', Rule::in(['online', 'file'])];
                $rules['submission_type'] = ['nullable', Rule::in(['online', 'written'])];
                $rules['assessment_content_json'] = 'nullable|string|max:200000';
                $rules['assessment_content_html'] = 'nullable|string|max:500000';
                $rules['assessment_instructions_json'] = 'nullable|string|max:100000';
                $rules['assessment_instructions_html'] = 'nullable|string|max:200000';
                $rules['questions'] = 'nullable|array';
                $rules['questions.*.id'] = 'required|string';
                $rules['questions.*.type'] = ['required', Rule::in(['MCQ', 'Essay'])];
                $rules['questions.*.question_text'] = 'required|string|max:10000';
                $rules['questions.*.points'] = 'required|integer|min:1|max:100';
                $rules['questions.*.choices'] = 'nullable|array';
                $rules['questions.*.answer'] = 'nullable|string|max:500';
                $rules['questions.*.keywords'] = 'nullable|array';
                $rules['questions.*.keywords.*'] = 'string|max:100';
                break;

            case 'assignment':
                $rules['assignment_title'] = 'required|string|min:3|max:255';
                $rules['total_points'] = 'nullable|integer|min:1|max:1000';
                $rules['assignment_type'] = 'nullable|string|max:255';
                $rules['started_at'] = 'nullable|date';
                $rules['expired_at'] = 'nullable|date|after:started_at';
                $rules['assignment_content_json'] = 'nullable|string|max:200000';
                $rules['assignment_content_html'] = 'nullable|string|max:500000';
                $rules['assignment_instructions_json'] = 'nullable|string|max:100000';
                $rules['assignment_instructions_html'] = 'nullable|string|max:200000';
                $rules['assignment_rubric_json'] = 'nullable|string|max:100000';
                $rules['assignment_rubric_html'] = 'nullable|string|max:200000';
                break;
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Please enter a title for this module item.',
            'title.min' => 'The title must be at least 3 characters long.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'description.max' => 'The description cannot exceed 1000 characters.',
            'item_type.required' => 'Please select an item type.',
            'item_type.in' => 'Please select a valid item type (lecture, assessment, or assignment).',
            'video_url.url' => 'Please enter a valid URL.',
            'assessment_title.required' => 'Please enter a title for this assessment.',
            'assignment_title.required' => 'Please enter a title for this assignment.',
            'max_score.min' => 'Maximum score must be at least 1.',
            'total_points.min' => 'Total points must be at least 1.',
            'expired_at.after' => 'End date must be after start date.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'item title',
            'description' => 'item description',
            'item_type' => 'item type',
            'video_url' => 'video URL',
            'duration' => 'duration',
            'content' => 'content',
            'order' => 'item order',
            'is_required' => 'required status',
            'status' => 'status',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $itemType = request()->input('item_type');
            $videoUrl = request()->input('video_url');
            $content = request()->input('content');
            $contentJson = request()->input('content_json');
            $contentHtml = request()->input('content_html');

            // For lectures, require either video URL or content
            if ($itemType === 'lecture') {
                $hasVideoUrl = !empty($videoUrl);
                $hasContent = !empty($content) || !empty($contentJson) || !empty($contentHtml);

                // Check if content_json has actual content (not just empty editor state)
                if (!empty($contentJson)) {
                    $decodedContent = json_decode($contentJson, true);
                    if (is_array($decodedContent) && isset($decodedContent['root']['children'])) {
                        // Check if there are actual content nodes (not just empty paragraphs)
                        $hasRealContent = false;
                        foreach ($decodedContent['root']['children'] as $child) {
                            if (isset($child['children']) && !empty($child['children'])) {
                                foreach ($child['children'] as $textNode) {
                                    if (isset($textNode['text']) && trim($textNode['text']) !== '') {
                                        $hasRealContent = true;
                                        break 2;
                                    }
                                }
                            }
                        }
                        $hasContent = $hasRealContent;
                    }
                }

                if (!$hasVideoUrl && !$hasContent) {
                    $validator->errors()->add('video_url', 'Please provide either a video URL or content for this lecture.');
                    $validator->errors()->add('content_json', 'Please provide either a video URL or content for this lecture.');
                }

                // Additional validation for YouTube URLs if provided
                if ($videoUrl) {
                    $isYouTube = preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $videoUrl);
                    $isVimeo = preg_match('/vimeo\.com\/(\d+)/', $videoUrl);

                    if (!$isYouTube && !$isVimeo) {
                        $validator->errors()->add('video_url', 'Please enter a valid YouTube or Vimeo URL.');
                    }
                }
            }
        });
    }
}
