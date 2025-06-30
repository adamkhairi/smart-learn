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
            'type' => ['required', Rule::in(['video', 'document', 'link', 'quiz', 'assignment'])],
            'order' => 'nullable|integer|min:1',
            'duration' => 'nullable|integer|min:0|max:86400', // Max 24 hours
            'is_required' => 'boolean',
        ];

        // Type-specific validation rules
        switch ($this->input('type')) {
            case 'video':
                $rules['url'] = 'required|url|max:500';
                $rules['duration'] = 'required|integer|min:1|max:86400'; // Duration required for videos
                break;

            case 'link':
                $rules['url'] = 'required|url|max:500';
                break;

            case 'document':
                if ($this->isMethod('POST')) {
                    // For creation, file is required
                    $rules['file'] = 'required|file|mimes:pdf,doc,docx,ppt,pptx,txt,xls,xlsx|max:10240'; // 10MB max
                } else {
                    // For updates, file is optional
                    $rules['file'] = 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,txt,xls,xlsx|max:10240';
                }
                break;

            case 'quiz':
            case 'assignment':
                $rules['content'] = 'required|string|min:10|max:50000'; // More reasonable limits
                $rules['url'] = 'nullable|url|max:500'; // Optional external link
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
            'title.required' => 'Please enter a title for this item.',
            'title.min' => 'The title must be at least 3 characters long.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'description.max' => 'The description cannot exceed 1000 characters.',
            'type.required' => 'Please select an item type.',
            'type.in' => 'Please select a valid item type.',
            'url.required' => 'Please enter a URL for this item.',
            'url.url' => 'Please enter a valid URL.',
            'url.max' => 'The URL cannot exceed 500 characters.',
            'file.required' => 'Please upload a file.',
            'file.file' => 'The uploaded file is invalid.',
            'file.mimes' => 'Please upload a PDF, Word document, PowerPoint, Excel file, or text file.',
            'file.max' => 'The file cannot be larger than 10MB.',
            'content.required' => 'Please enter content for this item.',
            'content.min' => 'The content must be at least 10 characters long.',
            'content.max' => 'The content cannot exceed 50,000 characters.',
            'order.integer' => 'The order must be a valid number.',
            'order.min' => 'The order must be at least 1.',
            'duration.required' => 'Please enter the duration for this video.',
            'duration.integer' => 'The duration must be a valid number.',
            'duration.min' => 'The duration must be at least 1 second.',
            'duration.max' => 'The duration cannot exceed 24 hours.',
            'is_required.boolean' => 'The required field must be true or false.',
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
            'type' => 'item type',
            'url' => 'URL',
            'file' => 'file',
            'content' => 'content',
            'order' => 'item order',
            'duration' => 'duration',
            'is_required' => 'required status',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional validation for YouTube URLs
            if ($this->input('type') === 'video' && $this->input('url')) {
                $url = $this->input('url');
                $isYouTube = preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url);
                $isVimeo = preg_match('/vimeo\.com\/(\d+)/', $url);

                if (!$isYouTube && !$isVimeo) {
                    $validator->errors()->add('url', 'Please enter a valid YouTube or Vimeo URL.');
                }
            }

            // Validate file size isn't too small
            if ($this->hasFile('file')) {
                $file = $this->file('file');
                if ($file->getSize() < 100) { // Less than 100 bytes
                    $validator->errors()->add('file', 'The uploaded file appears to be empty or corrupted.');
                }
            }
        });
    }
}
