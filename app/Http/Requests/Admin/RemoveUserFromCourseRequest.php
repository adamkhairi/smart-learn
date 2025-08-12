<?php
declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RemoveUserFromCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Gate via policies/middleware if needed
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ];
    }
}
