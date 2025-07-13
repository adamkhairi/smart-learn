<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class UserProgress extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'course_id',
        'course_module_id',
        'course_module_item_id',
        'status',
        'started_at',
        'completed_at',
        'last_accessed_at',
        'time_spent_seconds',
        'view_count',
        'score',
        'max_score',
        'is_graded',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'last_accessed_at' => 'datetime',
            'time_spent_seconds' => 'integer',
            'view_count' => 'integer',
            'score' => 'float',
            'max_score' => 'float',
            'is_graded' => 'boolean',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the user this progress belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course this progress belongs to.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the course module this progress belongs to.
     */
    public function courseModule(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class);
    }

    /**
     * Get the course module item this progress belongs to.
     */
    public function courseModuleItem(): BelongsTo
    {
        return $this->belongsTo(CourseModuleItem::class);
    }

    // === STATUS METHODS ===

    /**
     * Check if progress is not started.
     */
    public function isNotStarted(): bool
    {
        return $this->status === 'not_started';
    }

    /**
     * Check if progress is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if progress is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if progress is failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Mark progress as started.
     */
    public function markAsStarted(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => $this->started_at ?? now(),
            'last_accessed_at' => now(),
        ]);
    }

    /**
     * Mark progress as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'last_accessed_at' => now(),
        ]);
    }

    /**
     * Mark progress as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
            'last_accessed_at' => now(),
        ]);
    }

    /**
     * Update last accessed time.
     */
    public function updateLastAccessed(): void
    {
        $this->update(['last_accessed_at' => now()]);
    }

    /**
     * Increment view count.
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
        $this->updateLastAccessed();
    }

    /**
     * Add time spent in seconds.
     */
    public function addTimeSpent(int $seconds): void
    {
        $this->increment('time_spent_seconds', $seconds);
        $this->updateLastAccessed();
    }

    /**
     * Get formatted time spent.
     */
    public function getFormattedTimeSpent(): string
    {
        $hours = floor($this->time_spent_seconds / 3600);
        $minutes = floor(($this->time_spent_seconds % 3600) / 60);
        $seconds = $this->time_spent_seconds % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Get percentage score for assessments/assignments.
     */
    public function getPercentageScore(): ?float
    {
        if (!$this->score || !$this->max_score || $this->max_score == 0) {
            return null;
        }

        return round(($this->score / $this->max_score) * 100, 2);
    }

    /**
     * Update score for assessments/assignments.
     */
    public function updateScore(float $score, float $maxScore): void
    {
        $this->update([
            'score' => $score,
            'max_score' => $maxScore,
            'is_graded' => true,
        ]);
    }

    // === SCOPES ===

    /**
     * Scope to get progress for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get progress for a specific course.
     */
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('course_id', $courseId);
    }

    /**
     * Scope to get progress for a specific module.
     */
    public function scopeForModule($query, int $moduleId)
    {
        return $query->where('course_module_id', $moduleId);
    }

    /**
     * Scope to get completed progress.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get in-progress items.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope to get not started items.
     */
    public function scopeNotStarted($query)
    {
        return $query->where('status', 'not_started');
    }

    /**
     * Scope to get recent progress.
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('last_accessed_at', '>=', now()->subDays($days));
    }

    // === STATIC METHODS ===

    /**
     * Get or create progress for a user and module item.
     */
    public static function getOrCreate(int $userId, int $courseId, ?int $moduleId = null, ?int $itemId = null): self
    {
        return self::firstOrCreate([
            'user_id' => $userId,
            'course_id' => $courseId,
            'course_module_id' => $moduleId,
            'course_module_item_id' => $itemId,
        ], [
            'status' => 'not_started',
            'time_spent_seconds' => 0,
            'view_count' => 0,
            'is_graded' => false,
        ]);
    }

    /**
     * Get progress summary for a user in a course.
     */
    public static function getCourseProgressSummary(int $userId, int $courseId): array
    {
        $progress = self::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->get();

        $totalItems = $progress->count();
        $completedItems = $progress->where('status', 'completed')->count();
        $inProgressItems = $progress->where('status', 'in_progress')->count();
        $notStartedItems = $progress->where('status', 'not_started')->count();

        return [
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'in_progress_items' => $inProgressItems,
            'not_started_items' => $notStartedItems,
            'completion_percentage' => $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 2) : 0,
            'total_time_spent' => $progress->sum('time_spent_seconds'),
        ];
    }
}
