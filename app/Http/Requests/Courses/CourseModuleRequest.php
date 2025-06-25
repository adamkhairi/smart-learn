<?php

namespace App\Http\Requests\Courses;

use Illuminate\Foundation\Http\FormRequest;

class CourseModuleRequest extends FormRequest
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
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'nullable|integer|min:1',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The module title is required.',
            'title.max' => 'The module title may not be greater than 255 characters.',
            'description.max' => 'The module description may not be greater than 1000 characters.',
            'order.integer' => 'The order must be a valid number.',
            'order.min' => 'The order must be at least 1.',
            'is_published.boolean' => 'The published status must be true or false.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'module title',
            'description' => 'module description',
            'order' => 'module order',
            'is_published' => 'published status',
        ];
    }
}
