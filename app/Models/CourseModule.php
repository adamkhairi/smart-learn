<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use App\Models\UserProgress;

class CourseModule extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'course_id',
        'order',
        'is_published',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Get the course this module belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the module items for this module.
     */
    public function moduleItems(): HasMany
    {
        return $this->hasMany(CourseModuleItem::class);
    }

    /**
     * Alias for moduleItems relationship for compatibility.
     */
    public function items(): HasMany
    {
        return $this->moduleItems();
    }

    /**
     * Check if module is published.
     */
    public function isPublished(): bool
    {
        return $this->is_published === true;
    }

    /**
     * Get the items count as an attribute.
     */
    protected function itemsCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->moduleItems_count ?? $this->moduleItems()->count(),
        );
    }

    /**
     * Scope to get published modules.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope to get modules for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to order by module order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    /**
     * Get user progress for this module based on its items (item-level aggregation).
     */
    public function getUserProgress(int $userId): array
    {
        // Total items in this module
        $totalItems = $this->moduleItems()->count();

        if ($totalItems === 0) {
            return [
                'module_id' => $this->id,
                'total_items' => 0,
                'completed_items' => 0,
                'in_progress_items' => 0,
                'not_started_items' => 0,
                'completion_percentage' => 0,
            ];
        }

        // Prefer aggregating via stored course_module_id for efficiency
        $statusCounts = UserProgress::select('status', DB::raw('COUNT(*) as cnt'))
            ->where('user_id', $userId)
            ->where('course_module_id', $this->id)
            ->groupBy('status')
            ->pluck('cnt', 'status');

        // Backward-compat: if no rows found (legacy data missing course_module_id), fallback by item ids
        $countSum = array_sum(array_map('intval', $statusCounts->toArray()));
        if ($countSum === 0) {
            $itemIds = $this->moduleItems()->pluck('id');
            if ($itemIds->isNotEmpty()) {
                $statusCounts = UserProgress::select('status', DB::raw('COUNT(*) as cnt'))
                    ->where('user_id', $userId)
                    ->whereIn('course_module_item_id', $itemIds)
                    ->groupBy('status')
                    ->pluck('cnt', 'status');
            }
        }

        $completed = (int) ($statusCounts['completed'] ?? 0);
        $inProgress = (int) ($statusCounts['in_progress'] ?? 0);
        $notStarted = max(0, $totalItems - $completed - $inProgress);

        return [
            'module_id' => $this->id,
            'total_items' => $totalItems,
            'completed_items' => $completed,
            'in_progress_items' => $inProgress,
            'not_started_items' => $notStarted,
            'completion_percentage' => $totalItems > 0 ? round(($completed / $totalItems) * 100, 2) : 0,
        ];
    }
}
