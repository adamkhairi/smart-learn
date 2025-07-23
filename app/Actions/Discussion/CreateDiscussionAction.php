<?php

namespace App\Actions\Discussion;

use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Support\Facades\Auth;

class CreateDiscussionAction
{
    public function execute(Course $course, array $data): Discussion
    {
        return $course->discussions()->create([
            'created_by' => Auth::id(),
            'title' => $data['title'],
            'content' => $data['content'],
        ]);
    }
}
