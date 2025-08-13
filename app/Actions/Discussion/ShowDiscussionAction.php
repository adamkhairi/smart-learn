<?php

declare(strict_types=1);

namespace App\Actions\Discussion;

use App\Models\Discussion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class ShowDiscussionAction
{
    /**
     * Show a discussion with all related data and increment view count.
     *
     * @param Discussion $discussion
     * @param bool $incrementViews
     * @return Discussion
     * @throws Exception
     */
    public function execute(Discussion $discussion, bool $incrementViews = true): Discussion
    {
        try {
            return DB::transaction(function () use ($discussion, $incrementViews) {
                // Load all related data efficiently
                $discussion->load([
                    'user:id,name,email',
                    'course:id,title',
                    'comments' => function ($query) {
                        $query->with([
                            'user:id,name,email',
                            'replies' => function ($replyQuery) {
                                $replyQuery->with(['user:id,name,email', 'likes'])
                                          ->orderBy('created_at', 'asc');
                            },
                            'likes'
                        ])->orderBy('created_at', 'asc');
                    }
                ]);
                
                // Increment view count if requested
                if ($incrementViews) {
                    $discussion->increment('views_count');
                    
                    // Clear cache for this discussion's course
                    Cache::forget("discussions.course.{$discussion->course_id}.*");
                }
                
                Log::info('Discussion viewed successfully', [
                    'discussion_id' => $discussion->id,
                    'course_id' => $discussion->course_id,
                    'title' => $discussion->title,
                    'views_count' => $discussion->views_count,
                    'user_id' => auth()->id(),
                    'incremented_views' => $incrementViews,
                ]);
                
                return $discussion;
            });
        } catch (Exception $e) {
            Log::error('Failed to show discussion', [
                'error' => $e->getMessage(),
                'discussion_id' => $discussion->id,
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
