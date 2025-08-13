<?php

declare(strict_types=1);

namespace App\Actions\Discussion;

use App\Models\Discussion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class DeleteDiscussionAction
{
    /**
     * Delete a discussion and all related data.
     *
     * @param Discussion $discussion
     * @return bool
     * @throws Exception
     */
    public function execute(Discussion $discussion): bool
    {
        try {
            return DB::transaction(function () use ($discussion) {
                $discussionData = $discussion->toArray();
                $courseId = $discussion->course_id;
                
                // Check if discussion has comments that should be handled
                $commentsCount = $discussion->comments()->count();
                
                // Soft delete the discussion (preserves related data)
                $deleted = $discussion->delete();
                
                if ($deleted) {
                    // Clear related caches
                    Cache::forget("discussions.course.{$courseId}.*");
                    
                    Log::info('Discussion deleted successfully', [
                        'discussion_id' => $discussion->id,
                        'course_id' => $courseId,
                        'title' => $discussionData['title'],
                        'comments_count' => $commentsCount,
                        'user_id' => auth()->id(),
                    ]);
                }
                
                return $deleted;
            });
        } catch (Exception $e) {
            Log::error('Failed to delete discussion', [
                'error' => $e->getMessage(),
                'discussion_id' => $discussion->id,
                'course_id' => $discussion->course_id ?? null,
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
