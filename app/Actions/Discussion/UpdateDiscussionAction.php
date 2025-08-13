<?php

declare(strict_types=1);

namespace App\Actions\Discussion;

use App\Models\Discussion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class UpdateDiscussionAction
{
    /**
     * Update an existing discussion.
     *
     * @param Discussion $discussion
     * @param array $data
     * @return Discussion
     * @throws Exception
     */
    public function execute(Discussion $discussion, array $data): Discussion
    {
        try {
            return DB::transaction(function () use ($discussion, $data) {
                $originalData = $discussion->toArray();
                
                // Filter allowed fields for update
                $allowedFields = ['title', 'content', 'is_pinned', 'is_locked'];
                $updateData = array_intersect_key($data, array_flip($allowedFields));
                
                $discussion->update($updateData);
                
                Log::info('Discussion updated successfully', [
                    'discussion_id' => $discussion->id,
                    'course_id' => $discussion->course_id,
                    'original_data' => $originalData,
                    'updated_data' => $updateData,
                    'user_id' => auth()->id(),
                ]);
                
                return $discussion->fresh(['user', 'course']);
            });
        } catch (Exception $e) {
            Log::error('Failed to update discussion', [
                'error' => $e->getMessage(),
                'discussion_id' => $discussion->id,
                'data' => $data,
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
