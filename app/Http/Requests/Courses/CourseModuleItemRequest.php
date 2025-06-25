<?php

namespace App\Http\Requests\Courses;

use Illuminate\Foundation\Http\FormRequest;

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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:video,document,link,quiz,assignment',
            'order' => 'nullable|integer|min:1',
            'duration' => 'nullable|integer|min:0',
            'is_required' => 'boolean',
        ];

        // Type-specific validation rules
        switch ($this->input('type')) {
            case 'video':
            case 'link':
                $rules['url'] = 'required|url';
                break;

            case 'document':
                if ($this->isMethod('POST')) {
                    // For creation, file is required
                    $rules['file'] = 'required|file|mimes:pdf,doc,docx,ppt,pptx,txt,xls,xlsx|max:10240'; // 10MB max
                } else {
                    // For updates, file is optional
                    $rules['file'] = 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,txt,xls,xlsx|max:10240';
                    $rules['url'] = 'nullable|string'; // Existing file path
                }
                break;

            case 'quiz':
            case 'assignment':
                $rules['content'] = 'required|string';
                $rules['url'] = 'nullable|url'; // Optional external link
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
            'title.required' => 'The item title is required.',
            'title.max' => 'The item title may not be greater than 255 characters.',
            'description.max' => 'The item description may not be greater than 1000 characters.',
            'type.required' => 'Please select an item type.',
            'type.in' => 'The selected item type is invalid.',
            'url.required' => 'The URL is required for this item type.',
            'url.url' => 'Please enter a valid URL.',
            'file.required' => 'Please upload a file for this document.',
            'file.file' => 'The uploaded file is invalid.',
            'file.mimes' => 'The file must be a PDF, Word document, PowerPoint, text file, or Excel file.',
            'file.max' => 'The file may not be larger than 10MB.',
            'content.required' => 'Content is required for this item type.',
            'order.integer' => 'The order must be a valid number.',
            'order.min' => 'The order must be at least 1.',
            'duration.integer' => 'The duration must be a valid number.',
            'duration.min' => 'The duration must be at least 0.',
            'is_required.boolean' => 'The required status must be true or false.',
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
                if (!preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url)) {
                    $validator->errors()->add('url', 'Please enter a valid YouTube URL.');
                }
            }

            // Validate duration for video items
            if ($this->input('type') === 'video' && !$this->input('duration')) {
                $validator->errors()->add('duration', 'Duration is required for video items.');
            }
        });
    }
}
