<?php

declare(strict_types=1);

namespace App\Actions\Discussion;

use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class ListDiscussionsAction
{
    /**
     * List discussions for a course with pagination and caching.
     *
     * @param Course $course
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function execute(Course $course, array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        try {
            $cacheKey = "discussions.course.{$course->id}." . md5(serialize($filters) . $perPage);
            $cacheTtl = 300; // 5 minutes
            
            return Cache::remember($cacheKey, $cacheTtl, function () use ($course, $filters, $perPage) {
                $query = $course->discussions()
                    ->with(['user:id,name,email', 'course:id,title'])
                    ->withCount(['comments'])
                    ->select(['id', 'title', 'content', 'course_id', 'created_by', 'is_pinned', 'is_locked', 'views_count', 'created_at', 'updated_at']);
                
                // Apply filters
                if (isset($filters['search']) && !empty($filters['search'])) {
                    $search = $filters['search'];
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'ILIKE', "%{$search}%")
                          ->orWhere('content', 'ILIKE', "%{$search}%");
                    });
                }
                
                if (isset($filters['pinned']) && $filters['pinned']) {
                    $query->where('is_pinned', true);
                }
                
                if (isset($filters['locked']) && $filters['locked']) {
                    $query->where('is_locked', true);
                }
                
                // Order: pinned first, then by latest
                $query->orderBy('is_pinned', 'desc')
                      ->latest();
                
                $discussions = $query->paginate($perPage);
                
                Log::info('Discussions listed successfully', [
                    'course_id' => $course->id,
                    'total_discussions' => $discussions->total(),
                    'filters' => $filters,
                    'per_page' => $perPage,
                ]);
                
                return $discussions;
            });
        } catch (Exception $e) {
            Log::error('Failed to list discussions', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'filters' => $filters,
            ]);
            
            throw $e;
        }
    }
}
