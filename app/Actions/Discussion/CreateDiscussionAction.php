<?php

declare(strict_types=1);

namespace App\Actions\Discussion;

use App\Models\Course;
use App\Models\Discussion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Auth\Authenticatable;
use Exception;

class CreateDiscussionAction
{
    /**
     * Create a new discussion in a course.
     *
     * @param Course $course
     * @param array $data
     * @param Authenticatable|null $user
     * @return Discussion
     * @throws Exception
     */
    public function execute(Course $course, array $data, ?Authenticatable $user = null): Discussion
    {
        $user = $user ?? auth()->user();
        
        if (!$user) {
            throw new Exception('User must be authenticated to create discussions');
        }
        
        try {
            return DB::transaction(function () use ($course, $data, $user) {
                $discussionData = [
                    'created_by' => $user->id,
                    'title' => $data['title'],
                    'content' => $data['content'],
                    'is_pinned' => $data['is_pinned'] ?? false,
                    'is_locked' => $data['is_locked'] ?? false,
                ];
                
                $discussion = $course->discussions()->create($discussionData);
                
                Log::info('Discussion created successfully', [
                    'discussion_id' => $discussion->id,
                    'course_id' => $course->id,
                    'title' => $discussion->title,
                    'created_by' => $user->id,
                ]);
                
                return $discussion->load(['user', 'course']);
            });
        } catch (Exception $e) {
            Log::error('Failed to create discussion', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'data' => $data,
                'user_id' => $user->id ?? null,
            ]);
            
            throw $e;
        }
    }
}
